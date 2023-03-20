import axios, { AxiosInstance } from "axios";
import {
  createCustomRunner,
  CustomRunnerOptions,
  initEnv,
  RemoteCacheImplementation,
} from "nx-remotecache-custom";
import { Stream, Readable } from "stream";

const ENV_URL = "NXCACHE_ARTIFACTORY_URL";
const ENV_USER = "NXCACHE_ARTIFACTORY_USER";
const ENV_SECRET = "NXCACHE_ARTIFACTORY_SECRET";
const ENV_RETENTION = "NXCACHE_ARTIFACTORY_RETENTION";

const getEnv = (key: string) => process.env[key];

interface RunnerOptions {
  url: string;
  user: string;
  secret: string;
  retention: number;
}

export class Client {
  private instance: AxiosInstance;
  private retention: number;
  constructor(opts: RunnerOptions) {
    this.instance = axios.create({
      baseURL: opts.url,
      auth: { username: opts.user, password: opts.secret },
    });
    this.retention = opts.retention;
  }
  async download(fileName: string): Promise<Readable> {
    const resp = await this.instance.get(fileName, { responseType: "stream" });
    return resp.data;
  }

  async upload(fileName: string, stream: Stream): Promise<unknown> {
    await this.instance.put(fileName, stream, {
      params: { properties: `RetentionPolicy=${this.retention}` },
    });
    return;
  }

  async exists(fileName: string): Promise<boolean> {
    try {
      const resp = await this.instance.head(fileName);
      return resp.status === 200;
    } catch (_) {
      return false;
    }
  }
}

function getClient(options: CustomRunnerOptions<RunnerOptions>): Client {
  const url = getEnv(ENV_URL) ?? options.url;
  const user = getEnv(ENV_USER) ?? options.user;
  const secret = getEnv(ENV_SECRET) ?? options.secret;
  const retention = Number(getEnv(ENV_RETENTION)) ?? options.retention;

  return new Client({
    url,
    user,
    secret,
    retention,
  });
}

const runner: unknown = createCustomRunner<RunnerOptions>(
  async (options): Promise<RemoteCacheImplementation> => {
    initEnv(options);

    const client = getClient(options);
    return {
      name: "HTTP Storage",
      fileExists: async (fileName) => {
        const result = await client.exists(fileName);
        return result;
      },
      retrieveFile: (filename) => client.download(filename),
      storeFile: (filename, stream) => client.upload(filename, stream),
    };
  }
);

export default runner;
