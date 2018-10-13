docker build -t slogan_app .
workdir=$(pwd)
docker run --rm -v ${workdir}:/usr/share/nginx/html -p 8080:80 --name sapp slogan_app
