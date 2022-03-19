#Creates a layer from node:alpine image.
FROM node:14

#Creates directories
RUN mkdir -p /usr/src/app

#Sets the working directory for any RUN, CMD, ENTRYPOINT, COPY, and ADD commands
WORKDIR /usr/src/app

#Copy new files or directories into the filesystem of the container
COPY package.json /usr/src/app
COPY package-lock.json /usr/src/app

#Execute commands in a new layer on top of the current image and commit the results
RUN npm install

##Copy new files or directories into the filesystem of the container
COPY . /usr/src/app

#Informs container runtime that the container listens on the specified network ports at runtime
EXPOSE 8080

#Allows you to configure a container that will run as an executable
CMD ["node", "run", "dev"]
