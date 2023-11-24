import { SSTConfig } from "sst";
import { APP } from "./stacks/Stack";

export default {
  config(_input) {
    return {
      name: "CustomLinkRedirector",
      region: "us-east-1",
    };
  },
  stacks(app) {
    app.stack(APP);
  }
} satisfies SSTConfig;
