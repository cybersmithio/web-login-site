#!/bin/sh
#This script expects the following environment variables to be set:
# REPO
# IMAGE
# TAG
# TENABLE_IO_ACCESS_KEY
# TENABLE_IO_SECRET_KEY
while [ 1 -eq 1]; do
  RESP=`curl --request GET --url 'https://cloud.tenable.com/container-security/api/v1/compliancebyname?image=$IMAGE&repo=$REPO&tag=$TAG --header 'accept: application/json' --header 'x-apikeys: accessKey=$TENABLE_IO_ACCESS_KEY;secretKey=$TENABLE_IO_SECRET_KEY'`
  if [ "x$RESP" = "xpass" ] ; then
    exit 0
  fi
  if [ "x$RESP" = "xfail" ] ; then
    exit 1
  fi
  sleep 30
