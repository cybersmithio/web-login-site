#!/bin/sh
#This script expects the following environment variables to be set:
# REPO, IMAGE, TAG, TENABLE_IO_ACCESS_KEY, TENABLE_IO_SECRET_KEY
echo "Checking $REPO/$IMAGE:$TAG"
echo "Tenable.io Access Key: $TENABLE_IO_ACCESS_KEY"
while [ 1 -eq 1 ]; do
  RESP=`curl -s --request GET --url "https://cloud.tenable.com/container-security/api/v1/compliancebyname?image=$IMAGE&repo=$REPO&tag=$TAG" --header 'accept: application/json' --header "x-apikeys: accessKey=$TENABLE_IO_ACCESS_KEY;secretKey=$TENABLE_IO_SECRET_KEY"| sed -n 's/.*\"status\":\"\([^\"]*\)\".*/\1/p'`
  if [ "x$RESP" = "xpass" ] ; then
    echo "Container marked as PASSED by policy rules"
    exit 0
  fi
  if [ "x$RESP" = "xfail" ] ; then
    echo "Container marked as FAILED by policy rules"
    exit 1
  fi
  sleep 30
done