FROM node

COPY ./package.json /.
COPY node_modules /.
COPY lib /worker/lib
# COPY swagger.yml /.