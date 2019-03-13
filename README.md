# web-login-site
A basic Node.js website with an authenticated section.  This is to test web app security scanner logins.


# Build instructions
docker build -t web-site-login ./

# To run
docker rm web-site-login1; docker run -it -p 443:443 --name=web-site-login1 web-site-login
