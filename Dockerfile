# Step 1: Use the official Node.js image as a base
FROM node:20-alpine

# Step 2: Install bash
RUN apk add --no-cache bash

# Step 3: Set the working directory inside the container
WORKDIR /app

# Step 4: Copy package.json and package-lock.json to install dependencies
COPY package*.json ./

# Step 5: Install ALL dependencies (including devDependencies)
RUN npm install

# Step 6: Copy all application files
COPY . .

# Step 7: Build the TypeScript files
RUN npm run build

# Step 9: Expose the port your application will run on (default Express port)
EXPOSE 8000

# Step 10: Define the command to run the app
CMD ["npm", "start"]
