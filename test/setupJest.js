global.fetch = require("jest-fetch-mock");
jest.setMock("cross-fetch", global.fetch); // Use this to mock your ponyfilled fetch module
