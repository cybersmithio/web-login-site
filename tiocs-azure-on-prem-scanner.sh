#!/bin/sh
#This script expects the following environment variables to be set:
# BUILD_BUILDID - This is set by Azure if you have called this script from a Docker Build and Push step
# IMAGEREPOSITORY - This is set by Azure if you have called this script from a Docker Build and Push step
# TenableIOAccessKey - Should come from the Azure Key Vault
# TenableIOSecretKey - Should come from the Azure Key Vault
# TenableIOJFrog - Should come from the Azure Key Vault
TIOACCESSKEY=$1
TIOSECRETKEY=$2
TIOJFROGPASS=$3

echo "Checking $IMAGEREPOSITORY:$BUILD_BUILDID and analyzing results on-premise then reporting into cloud.tenable.com repo $IMAGEREPOSITORY"
echo "Tenable.io Access Key: $TenableIOAccessKey"
echo ""
echo "Variables list:"
set

echo "Download Tenable.io on-prem scanner"

docker login --username pubread --password $TenableIOJFrog tenableio-docker-consec-local.jfrog.io
docker pull tenableio-docker-consec-local.jfrog.io/cs-scanner:latest

docker images

echo "Start of on-prem analysis"
set -x
docker save $IMAGEREPOSITORY:$BUILD_BUILDID | docker run -e DEBUG_MODE=true -e TENABLE_ACCESS_KEY=$TenableIOAccessKey -e TENABLE_SECRET_KEY=$TenableIOSecretKey -e IMPORT_REPO_NAME=$IMAGEREPOSITORY -i tenableio-docker-consec-local.jfrog.io/cs-scanner:latest inspect-image $IMAGEREPOSITORY:$BUILD_BUILDID
if [ $? != 0 ]; then
  echo "Error analyzing container image"
  exit 1
fi
set +x
echo "End of on-prem analysis"

echo "Download report on image"
while [ 1 -eq 1 ]; do
  RESP=`curl -s --request GET --url "https://cloud.tenable.com/container-security/api/v1/compliancebyname?image=$IMAGEREPOSITORY&repo=$IMAGEREPOSITORY&tag=$BUILD_BUILDID" \
  --header 'accept: application/json' --header "x-apikeys: accessKey=$TenableIOAccessKey;secretKey=$TenableIOSecretKey" \
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