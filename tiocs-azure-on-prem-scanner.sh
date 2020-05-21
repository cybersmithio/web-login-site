#!/bin/sh
# This script excepts 3 command-line arguments in this particular order: Tenable.io Access Key, Tenable.io Secret Key, Tenable.io JFrog pubread password
#This script expects the following environment variables to be set:
# BUILD_BUILDID - This is set by Azure if you have called this script from a Docker Build and Push step
# IMAGEREPOSITORY - This is set by Azure if you have called this script from a Docker Build and Push step
TIOACCESSKEY=$1
TIOSECRETKEY=$2
TIOJFROGPASS=$3

echo "Checking $IMAGEREPOSITORY:$BUILD_BUILDID and analyzing results on-premise then reporting into cloud.tenable.com repo $IMAGEREPOSITORY"
echo "Tenable.io Access Key: $TIOACCESSKEY"
echo ""

#For debugging
echo "Variables list:"
set

echo "Download Tenable.io on-prem scanner"

docker login --username pubread --password $TIOJFROGPASS tenableio-docker-consec-local.jfrog.io
docker pull tenableio-docker-consec-local.jfrog.io/cs-scanner:latest

#For debugging
#docker images

echo "Start of on-prem analysis"
set -x


#IMAGEREPOSITORY=$BUILD_REPOSITORY_ID
#IMAGEREPOSITORY=$BUILD_DEFINITIONNAME
#IMAGEREPOSITORY=tenabledemoacr.azurecr.io/web-login-site
#IMAGEREPOSITORY=tenabledemoacr.azurecr.io/web-login-site


docker save $BUILD_REPOSITORY_ID:$BUILD_BUILDID | docker run -e DEBUG_MODE=true -e TENABLE_ACCESS_KEY=$TIOACCESSKEY -e TENABLE_SECRET_KEY=$TIOSECRETKEY -e IMPORT_REPO_NAME=$IMAGEREPOSITORY -i tenableio-docker-consec-local.jfrog.io/cs-scanner:latest inspect-image $IMAGEREPOSITORY:$BUILD_BUILDID

docker save $BUILD_DEFINITIONNAME:$BUILD_BUILDID | docker run -e DEBUG_MODE=true -e TENABLE_ACCESS_KEY=$TIOACCESSKEY -e TENABLE_SECRET_KEY=$TIOSECRETKEY -e IMPORT_REPO_NAME=$IMAGEREPOSITORY -i tenableio-docker-consec-local.jfrog.io/cs-scanner:latest inspect-image $IMAGEREPOSITORY:$BUILD_BUILDID


if [ $? != 0 ]; then
  echo "Error analyzing container image"
  exit 1
fi
set +x
echo "End of on-prem analysis"

echo "Download report on image"
while [ 1 -eq 1 ]; do
  RESP=`curl -s --request GET --url "https://cloud.tenable.com/container-security/api/v1/compliancebyname?image=$IMAGEREPOSITORY&repo=$IMAGEREPOSITORY&tag=$BUILD_BUILDID" \
  --header 'accept: application/json' --header "x-apikeys: accessKey=$TIOACCESSKEY;secretKey=$TIOSECRETKEY" \
  | sed -n 's/.*\"status\":\"\([^\"]*\)\".*/\1/p'`
  echo "Report status: $RESP"
  if [ "x$RESP" = "xpass" ] ; then
    echo "Container marked as PASSED by policy rules"
    echo "Retagging for container registry"
    docker tag $IMAGEREPOSITORY:$BUILD_BUILDID $CONTAINERREGISTRY/$IMAGEREPOSITORY:$BUILD_BUILDID
    exit 0
  fi
  if [ "x$RESP" = "xfail" ] ; then
    echo "Container marked as FAILED by policy rules"
    exit 1
  fi
  echo "Waiting 30 seconds before checking again for report"
  sleep 30
done