# web-login-site
A basic Node.js website with an authenticated section.  This is to test web app security scanner logins.


# Build instructions
docker build -t web-site-login ./

# To run directly on a Docker engine
docker rm web-login-site1; docker run -it -p 443:443 --name=web-login-site1 web-login-site

# Example of deployment to a Kubernetes cluster
kubectl --kubeconfig ./kubernetes-admin.conf create -f yml/web-login-site-pod.yml
kubectl --kubeconfig ./kubernetes-admin.conf create -f web-login-site-service.yml

# Example of checking the deployment status on a Kubernetes cluster
kubectl --kubeconfig ./kubernetes-admin.conf describe pod web-login-site.example.com

# Example of exposing pod for access externally from the Kubernetes cluster
kubectl --kubeconfig ./kubernetes-admin.conf -f web-login-site-pod.yml --name=webloginport


# Example of undeployment from a Kubernetes cluster
kubectl --kubeconfig ./kubernetes-admin.conf delete -f web-login-site-service.yml
kubectl --kubeconfig ./kubernetes-admin.conf delete -f yml/web-login-site-pod.yml


#Made a change to trigger a build 2019-03-24