# web-login-site
A basic Node.js website with an authenticated section.  This is to test web app security scanner logins.


# Build instructions
docker build -t web-site-login ./

# To run directly on a Docker engine
docker rm web-login-site1; docker run -it -p 443:443 --name=web-login-site1 web-login-site

# To deploy to a Kubernetes cluster
kubectl create -f yml/web-login-site-pod.yml

