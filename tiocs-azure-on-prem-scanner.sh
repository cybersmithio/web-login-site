#!/bin/sh
#This script expects the following environment variables to be set:
# REPO, IMAGE, TAG, $TENABLEACCESSKEY, $TENABLESECRETKEY, $TENABLEJFROGPASSWORD
echo "Checking $IMAGE:$TAG and analyzing results on-premise then reporting into cloud.tenable.com repo $REPO"
echo "Tenable.io Access Key: $TENABLEACCESSKEY"
echo ""
echo "Variables list:"
set

echo "Build image"
set -x
docker build ./ -t $IMAGE:$BUILD_BUILDID
set +x

echo "Download Tenable.io on-prem scanner"

docker login --username pubread --password $TENABLEJFROGPASSWORD tenableio-docker-consec-local.jfrog.io
docker pull tenableio-docker-consec-local.jfrog.io/cs-scanner:latest

echo "Start of on-prem analysis"
set -x
docker save $IMAGE:$BUILD_BUILDID | docker run -e DEBUG_MODE=true -e TENABLE_ACCESS_KEY=$TENABLEACCESSKEY -e TENABLE_SECRET_KEY=$TENABLESECRETKEY -e IMPORT_REPO_NAME=$REPO -i tenableio-docker-consec-local.jfrog.io/cs-scanner:latest inspect-image $IMAGE:$TAG
set +x
echo "End of on-prem analysis"

echo "Download report on image"
while [ 1 -eq 1 ]; do
  RESP=`curl -s --request GET --url "https://cloud.tenable.com/container-security/api/v1/compliancebyname?image=$IMAGE&repo=$REPO&tag=$BUILD_BUILDID" \
  --header 'accept: application/json' --header "x-apikeys: accessKey=$TENABLEACCESSKEY;secretKey=$TENABLESECRETKEY" \
  | sed -n 's/.*\"status\":\"\([^\"]*\)\".*/\1/p'`
  echo "Report status: $RESP"
  if [ "x$RESP" = "xpass" ] ; then
    echo "Container marked as PASSED by policy rules"
    exit 0
  fi
  if [ "x$RESP" = "xfail" ] ; then
    echo "Container marked as FAILED by policy rules"
    exit 1
  fi
  echo "Waiting 30 seconds before checking again for report"
  sleep 30
done