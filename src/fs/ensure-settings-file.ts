import { appConfigDir, join } from '@tauri-apps/api/path';
import { mkdir, readDir, readTextFile, writeFile, BaseDirectory } from '@tauri-apps/plugin-fs';

import { ConfigOptions, parseOptions } from '../config/config';

/**
 * @internal
 */
export enum STATUS {
  FILE_EXISTS = 'file_exists',
  FILE_CREATED = 'file_created'
}

/**
 * @internal
 */
export async function ensureSettingsFile(options: ConfigOptions = {}): Promise<{
  status: STATUS,
  path: string,
  content: string,
}> {
  try {
    const finalConfig = parseOptions(options);
    const finalDir = finalConfig.dir ?? await appConfigDir();

    const settingsFilePath = await join(finalDir, finalConfig.fileName);

    // create appConfigDir()
    try {
      await readDir(finalDir);
    }
    catch (e) {
      // doesn't exist
      try {
        await mkdir(finalDir, {recursive: true, baseDir: BaseDirectory.AppConfig});
      }
      catch (e) {
        throw e;
      }
    }

    try {
      const content = await readTextFile(settingsFilePath, { baseDir: BaseDirectory.AppConfig });

      return {
        status: STATUS.FILE_EXISTS,
        path: settingsFilePath,
        content
      }
    }
    catch(e) {
      // doesn't exist

        try {
        await writeFile(
            settingsFilePath,
            new Uint8Array([123, 125]), // {}
            { baseDir: BaseDirectory.AppConfig}
        )

        return {
          status: STATUS.FILE_CREATED,
          path: settingsFilePath,
          content: JSON.stringify({}, null, finalConfig.prettify ? finalConfig.numSpaces : 0)
        }
      }
      catch (e) {
        throw e;
      }
    }
  }
  catch (e) {
    throw e;
  }
}
