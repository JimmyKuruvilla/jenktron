#!/usr/bin/env node
import { cliInit } from './jenkcli';
import { JenkinsHttp } from './jenkinsHttp/jenkinsHttp.class';
import { browserInit } from './jenktron';
import { PipelineService } from './services/pipeline/pipeline.service';

(async () => {
  if (process.env.CLI) {
    const user = process.env.USER;
    const password = process.env.PASSWORD;
    if (user && password && process.env.JENKINS_URL) {
      const jenkinsHttp = new JenkinsHttp(user, password);
      const pipelineService = new PipelineService(jenkinsHttp);
      await cliInit(pipelineService);
    } else {
      console.log(`please set USER, PASSWORD and JENKINS_URL environment variables:
  export USER=yourusername
  export PASSWORD=yourpassword (can use an access token instead)
  export JENKINS_URL=http://yourJenkinsAddress:PORT`);
    }
  } else {
    await browserInit();
  }
})();
