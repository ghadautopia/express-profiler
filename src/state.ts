import { ProfilerError } from "./types";
import { ProfilerStream } from "./types/ProfilerStream";
import { ProfilerScope } from "./types/ProfilerScope";

export const state = (() => {
  const _scopes: ProfilerScope[] = [];
  const _streams: ProfilerStream[] = [];

  return {
    debugRoute: "/_debug",
    rootRoute: "/_ghada_profiler",
    profilerTokenKey: "X-Profiler-Token",
    profilerLinkKey: "X-Profiler-Link",
    get logStreams() {
      return _streams;
    },
    get scopes() {
      return _scopes;
    },
    registerStream(stream: ProfilerStream) {
      if (!(stream instanceof ProfilerStream)) {
        throw new ProfilerError(
          `The stream ${JSON.stringify(
            stream
          )} is not instance of ProfilerLogStream`,
          500
        );
      }

      // stream already defined
      if (_streams.find((str) => str === stream)) {
        return;
      }

      if (_streams.find((str) => str.name === stream.name)) {
        throw new ProfilerError(
          `A stream named ${stream.name} already exists`,
          500
        );
      }

      _streams.push(stream);
    },
    registerScope(scope: ProfilerScope) {
      if (!(scope instanceof ProfilerScope)) {
        throw new ProfilerError(
          `The scope ${JSON.stringify(scope)} is not instance of ProfilerScope`,
          500
        );
      }

      // scope already defined
      if (_scopes.find((scp) => scp === scope)) {
        return;
      }

      // name collision - 2 scopes with the same name
      if (_scopes.find((scp) => scp.name === scope.name)) {
        scope.name = `${scope.name}_${Date.now()}`;
      }

      _scopes.push(scope);
    },
    getProfilerTokenRoute(token: string) {
      return `${this.rootRoute}/token/${token}`;
    },
    getScopeTokenRoute(token: string, id: number) {
      return `${this.getProfilerTokenRoute(token)}/scope/${id}`;
    },
  };
})();
