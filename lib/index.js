//#region src/index.ts
/**
* dsh-feng-gu — node half.
*
* Pure UI plugin: the empty apply exists so the plugin appears in the host
* cordis.yml / Loader; the browser half ships via `exports["./client"]`,
* discovered through the package.json `dsh.client` declaration.
*/
function apply() {}
//#endregion
export { apply };
