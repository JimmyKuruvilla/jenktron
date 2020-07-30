# jenkcli

cli for jenkins pipeline status, works with Node 12+. Relies on having a Pipelines "view" in jenkins ui that lists all of your pipelines.

`chmod +x BINARY`

Run from source:

0. `npm i`
1. open tunnel to jenkins
2. CLI: `USER=yourusername PASSWORD=yourpasswordToJenkins JENKINS_URL=http://yourJenkinsAddress:PORT CLI=1` followed by `BINARY` or `npm run start:cli`
3. Electron: `npm run start:app` and set your settings.

You can also use a jenkins token instead of a password if you'd like or if your password has a lot of symbols.

To build/package:

1. `npm run build`
2. package CLI: `npm run pack:cli`
3. pacakge Electron: `npm run pack:app`

To build for linux, mac, or windows:
See : `https://www.electron.build/multi-platform-build#docker`
