# CaSMM

> Computation and Science Modeling through Making

Cloud-based programming interface

![Deploy Staging](https://github.com/STEM-C/CaSMM/workflows/Deploy%20Staging/badge.svg)
![Deploy Production](https://github.com/STEM-C/CaSMM/workflows/Deploy%20Production/badge.svg)

<br/>

## Project 6: Workspaces & Toolbox - Blocks (by Group 10a: Sapphire Division)

### Project Features:
#### Block Generator Overview
Our group mainly focused our efforts on developing the Block Generator, an extension of CASMM's Block Canvas. In the Block Generator, users can customize new blocks to use in the toolbox of the Block Canvas.

Here is an example of how it should appear according to a Content Creator.

<img width="1128" alt="image" src="https://github.com/Group-10a/Sapphire-Project06-10a/assets/105729738/94c7530e-8b87-4f96-b808-12130053554c">

The Block Generator is separated into 5 main components, listed below:

1. Block Factory and Preview

Users can create custom blocks within the Block Factory section. They can see the visual changes to their block in real time in the adjacent Block Preview.

<img width="792" alt="image" src="https://github.com/Group-10a/Sapphire-Project06-10a/assets/105729738/4d1cfbf3-6320-476c-9bdb-1c9dd8b7e387">

2. Form to send blocks

As the user creates their block, the Block Definition and Generator Stub text areas are changed in real time to reflect the user's actions. These forms are editable in case the user desires to change the Arduino code that appears when the block is dragged into the Block Canvas. Once the user is ready to send their block to the Gallery (where the block is stored in the Strapi back-end), they can click the "Send" button. The user receives the new block's ID in return.

This is how the form appears if the operation was successful:

<img width="267" alt="image" src="https://github.com/Group-10a/Sapphire-Project06-10a/assets/105729738/25a8674d-a69a-4470-8bdb-ed2483ee4064">

This is how the form appears if the operation was unsuccessful:

<img width="261" alt="image" src="https://github.com/Group-10a/Sapphire-Project06-10a/assets/105729738/f201db1f-161c-4ebc-a167-52abe5552b06">

If the block was successfully sent to the back-end, users can reload the page manually or click the "Refresh" button to reload the page so that the block appears in the user's toolbox in the Block Canvas:

<img width="263" alt="image" src="https://github.com/Group-10a/Sapphire-Project06-10a/assets/105729738/5efb9d77-0ed7-4fea-92ea-a0de1d00c3ae">

Additionally, when the block is dragged into the Block Canvas and the user shows the Arduino Code for the canvas, the custom block's code should appear in the correct position:

<img width="565" alt="image" src="https://github.com/Group-10a/Sapphire-Project06-10a/assets/105729738/2911df28-2c05-4f45-baa2-426f78dfff8c">

3. Form to receive blocks

Users can receive block information for any existing block in the Strapi back-end from the block's ID in real time using the "Receive" button.

This is how the form appears if the operation was successful:

<img width="357" alt="image" src="https://github.com/Group-10a/Sapphire-Project06-10a/assets/105729738/3e02a924-b715-4d6d-9d3e-b43328122e0b">

This is how the form appears if the operation was unsuccessful:

<img width="355" alt="image" src="https://github.com/Group-10a/Sapphire-Project06-10a/assets/105729738/5e1a17cf-08f4-4ef8-8bca-011ed76e8fe1">

4. Form to delete blocks

Users can delete blocks within the User category (but not blocks outside of it) from the block's ID in real time using the "Delete" button.

This is how the form appears if the operation was successful:

<img width="356" alt="image" src="https://github.com/Group-10a/Sapphire-Project06-10a/assets/105729738/e94a8da6-0d83-49c0-a86a-9e09ae1a3e14">

This is how the form appears if the operation was unsuccessful:

<img width="356" alt="image" src="https://github.com/Group-10a/Sapphire-Project06-10a/assets/105729738/7ac9df7b-bbe7-491d-8e3b-d8e9e903c22c">

Of course, after a user deletes a custom block, they can no longer receive the block that was originally assigned that block ID:

<img width="356" alt="image" src="https://github.com/Group-10a/Sapphire-Project06-10a/assets/105729738/64ab511a-6175-4dbb-871b-9c64c3e8402f">

5. Unit Tests

We have displayed 6 unit tests on the page's front-end to test the back-end functionality of the send, receive, and delete operations.

This is how the unit test form appears by default:

<img width="363" alt="image" src="https://github.com/Group-10a/Sapphire-Project06-10a/assets/105729738/4a5a3417-111d-40c4-8489-e9e25a68ae26">

This is how the unit test form appears when all test are run and return successfully:

<img width="366" alt="image" src="https://github.com/Group-10a/Sapphire-Project06-10a/assets/105729738/b46e162b-7a55-4845-9e9c-daabbd409510">

Here is what each unit test is meant for:
1. Sending an invalid block: This test case passes if a block is not sent because its formatting is invalid.
2. Receiving an invalid block (ID not found): This test case passes if a block is not found because a block with that ID does not exist.
3. Receiving a valid block: This test case passes if a block is found by its ID within the database.
4. Deleting an invalid block (ID not found): This test case passes if no block exists under the given ID, and therefore, nothing is deleted from the database.
5. Deleting an invalid block (block not in User category): This test case passes if a block under the given ID exists, but is prevented from being deleted because it is not under the User category. This was a design choice that I made to prevent users from accidentally deleting essential blocks in the database.
6. This is a comprehensive test that has multiple buttons to run. A helper button is provided to reset the process in case the buttons were not run in sequential order. Underneath the helper button, there are four buttons labeled from A to D. Respectively, these buttons test uploading a new block, receiving the new block, deleting the new block, and then attempting to receive it again, which is prevented. The tests display if they passed individually. If all test cases pass, then the larger test as a whole passes.

Each test case can either pass or fail, but they are all expected to pass under working conditions. Regardless of whether they pass or fail, the respective form that they test displays a status message on the front-end to let a user know whether an operation was successful or produced an error.

#### Block Gallery (Work-in-Progress)
The Block Gallery is still a work-in-progress feature. The goal is to display the name and code of each custom User block in a gridlike pattern.

Here is how the Block Gallery appears as of the end of our development phase:

<img width="1105" alt="image" src="https://github.com/Group-10a/Sapphire-Project06-10a/assets/105729738/b52a33ff-8ce8-41ea-8dc8-7219172642c0">

### Instructions to Run Locally:
These instructions assume that the user has already installed and is currently running Docker, has pulled the latest code from this repository, and has used `yarn start` to in the `client` folder to start CASMM.
1. Add a "User" category in Strapi, which should have an ID of 13. If it's not 13, then correct the variable in the code `const userCategoryID = '13';` with the number you receive instead for ContentCreatorCanvas.jsx, MentorCanvas.jsx, and StudentCanvas.jsx. E.g. `const userCategoryID = '14';`
2. On a CASMM page that displays the Block Generator, Right Click → Inspect → Application → Session Storage → http://localhost:3000 → copy the token. Visit http://localhost:1337/documentation/v1.0.0#/, click on the green Authorize button, and paste in the token.
On http://localhost:1337/admin/settings/ → Roles (under Users & Permissions Plugin) → Give every role, except for Public, all permissions under Blocks and Blocks-Category.
3. If everything was done correctly, this will fix a `500: Internal Server Error` when modifying the Strapi back-end using the front-end forms.

### Database Updating & Server Connections:
Our particular project relies solely on Strapi and does not involve other types of databases.

### Built Upon:
The Block Factory and Block Preview code is adapted from the following websites:

* [ArduBlockly](https://ardublockly.ymtech.education/ardublockly/blockfactory/index.html)

* [Blockly](https://blockly-demo.appspot.com/static/demos/blockfactory/index.html)

We used Bootstrap to style the front-end, primarily using the `Row` and `Col` components.

## Application

### `client` 
[client](/client#client) is the frontend of the application. It is powered by [React](https://reactjs.org/) and [Blockly](https://developers.google.com/blockly).

### `server`

[server](/server#server) is the web server and application server. It is powered by [Node](https://nodejs.org/en/) and [Strapi](https://docs-v3.strapi.io/developer-docs/latest/getting-started/introduction.html).

### `compile`

  [compile](/compile#compile) is an arduino compiler service. It is an unofficial fork of [Chromeduino](https://github.com/spaceneedle/Chromeduino).

<br/>

## Environments

> The project is divided into three conceptual environments.

### Development
#### Structure

The development environment is composed of five servers. The first one is run with the [Create React App](https://create-react-app.dev/docs/getting-started/) dev server. The later four are containerized with docker and run with [docker compose](https://docs.docker.com/compose/).

* `casmm-client-dev` - localhost:3000

* `casmm-server-dev` - localhost:1337/admin

* `casmm-compile-dev` 

* `casmm-db-dev` - localhost:5432

  > The first time the db is started, the [init_db.sh](/scripts/init_db.sh) script will run and seed the database with an environment specific dump. Read about Postgres initialization scripts [here](https://github.com/docker-library/docs/blob/master/postgres/README.md#initialization-scripts). To see how to create this dump, look [here](https://github.com/DavidMagda/CaSMM_fork_2023/blob/develop/scripts/readme.md).

* `casmm-compile_queue-dev`

#### Running

`casmm-client-dev`

1. Follow the [client](/client#setup) setup
2. Run `yarn start` from `/client`

`casmm-server-dev`, `casmm-compile-dev`, `casmm-db-dev`, and `casmm-compile_queue-dev`

1. Install [docker](https://docs.docker.com/get-docker/)

2. Run `docker compose up` from `/`

   > Grant permission to the **scripts** and **server** directories if you are prompted
   

### Staging

#### Structure

The staging environment is a Heroku app. It is composed of a web dyno, compile dyno, Heroku Postgres add-on, and Heroku Redis add-on.

* `casmm-staging` - [casmm-staging.herokuapp.com](https://casmm-staging.herokuapp.com/)
  * The web dyno runs `server`
  * The compile dyno runs `compile`

#### Running

`casmm-staging` is automatically built from the latest commits to branches matching `release/v[0-9].[0-9]`. Heroku runs the container orchestration from there.

### Production

#### Structure

The production environment is a Heroku app. It is composed of a web dyno, compile dyno, Heroku Postgres add-on, and Heroku Redis add-on.

* `casmm` - [www.casmm.org](https://www.casmm.org/)
  * The web dyno runs `server`
  * The compile dyno runs `compile`

#### Running

`casmm` is automatically built from the latest commits to `master`. Heroku runs the container orchestration from there.

<br/>

## Maintenance

All three components of the application have their own dependencies managed in their respective `package.json` files. Run `npm outdated` in each folder to see what packages have new releases. Before updating a package (especially new major versions), ensure that there are no breaking changes. Avoid updating all of the packages at once by running `npm update` because it could lead to breaking changes. 

### Strapi

This is by far the largest and most important dependency we have. Staying up to date with its [releases](https://github.com/strapi/strapi/releases) is important for bug/security fixes and new features. When it comes to actually upgrading Strapi make sure to follow the [migration guides](https://docs-v3.strapi.io/developer-docs/latest/update-migration-guides/migration-guides.html#v3-guides)!

<br/>

## CI/CD

All of the deployments and releases are handled automatically with [GitHub Actions](https://docs.github.com/en/actions). The workflows implement custom [Actions](https://github.com/STEM-C/CaSMM/actions) that live in the [auto](https://github.com/STEM-C/auto) repo.

<br/>

## Contributing

### Git Flow 

> We will follow this git flow for the most part — instead of individual release branches, we will have one to streamline staging deployment 

![Git Flow](https://nvie.com/img/git-model@2x.png)

### Branches

#### Protected

> Locked for direct commits — all commits must be made from a non-protected branch and submitted via a pull request with one approving review

- **master** - Production application

#### Non-protected

> Commits can be made directly to the branch

- **release** - Staging application
- **develop** - Working version of the application
- **feature/<`scaffold`>-<`feature-name`>** - Based off of develop
  - ex. **feature/cms-strapi**
- **hotfix/<`scaffold`>-<`fix-name`>** - Based off of master
  - ex. **hotfix/client-cors**

### Pull Requests

Before submitting a pull request, rebase the feature branch into the target branch to resolve any merge conflicts.

- PRs to **master** should squash and merge
- PRs to all other branches should create a merge commit
