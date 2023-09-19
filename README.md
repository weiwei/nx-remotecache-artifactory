# nx-remotecache-artifactory

A task runner for @nrwl/nx that uses an Artifactory generic storage as a remote cache. This enables all team members and CI servers to share a single cache. The concept and benefits of computation caching are explained in the NX documentation.

This package was built with [nx-remotecache-custom](https://www.npmjs.com/package/nx-remotecache-custom) 🙌

## NOTE

Version 0.0.4 works with NX 16+, version 0.0.5 works with NX 15-. Will sort this out later.

## Setup

```
npm install --save-dev nx-remotecache-artifactory
```

Use environment variables

| Parameter  | Description                                            |  Environment Variable / .env    | `nx.json`   |
| ---------- | ------------------------------------------------------ | ------------------------------- | ----------- |
| URL        | Artifactory URL to the folder path, ends with `/`      | `NXCACHE_ARTIFACTORY_URL`       | `url`       |
| User       | User name used for basic HTTP auth.                    | `NXCACHE_ARTIFACTORY_USER`      | `user`      |
| Secret     | Base64 encoded password for basic HTTP auth            | `NXCACHE_ARTIFACTORY_SECRET`    | `secret`    |
| Retention  | Retention time in days                                 | `NXCACHE_ARTIFACTORY_RETENTION` | `retention` |

Config in `nx.json`: change the name of the runner. Optionally, configure artifactory in `options`.

```json
{
  "tasksRunnerOptions": {
    "default": {
      "runner": "nx-remotecache-artifactory",
      "options": {
        "url": "http://your.artifactory/group/cach-dir",
        "user": "messi",
        "secret": "Fa23izFo0xzpK;",
        "retention": 15,
        "cacheableOperations": ["bootstrap", "build", "test", "lint", "e2e"]
      }
    }
  }
}
```
