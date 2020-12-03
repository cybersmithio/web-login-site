#!/bin/sh
TIOACCESSKEY=$1
TIOSECRETKEY=$2
TIOJFROGPASS=$3

docker login --username pubread --password $TIOJFROGPASS tenableio-docker-consec-local.jfrog.io
docker pull tenableio-docker-consec-local.jfrog.io/cs-scanner:latest

docker save $CONTAINERREGISTRY/$IMAGEREPOSITORY:$BUILD_BUILDID | docker run -e CHECK_POLICY=true \
-e DEBUG_MODE=true \
-e TENABLE_ACCESS_KEY=$TIOACCESSKEY \
-e TENABLE_SECRET_KEY=$TIOSECRETKEY \
-e IMPORT_REPO_NAME=$IMAGEREPOSITORY \
-i tenableio-docker-consec-local.jfrog.io/cs-scanner:latest inspect-image $IMAGEREPOSITORY:$BUILD_BUILDID

