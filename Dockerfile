FROM node:7.5.0-slim

RUN mkdir /web-explorer
COPY * /web-explorer
RUN cd /web-explorer && npm i && npm link && mkdir /web-files

CMD cd /web-files && web-explorer