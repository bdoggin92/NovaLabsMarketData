import { test } from 'node:test';
import assert from 'node:assert/strict';
import { resolve } from 'node:path';
import { resolveConfigPath, resolveStateDir, resolveWorkspaceDir } from '../../src/utils/config';

test('resolveStateDir uses override', () => {
  const env = { AUTOPILOT_STATE_DIR: '/tmp/autopilot-state' } as NodeJS.ProcessEnv;
  assert.equal(resolveStateDir(env), resolve('/tmp/autopilot-state'));
});

test('resolveConfigPath uses override', () => {
  const env = { AUTOPILOT_CONFIG_PATH: '/tmp/autopilot.json' } as NodeJS.ProcessEnv;
  assert.equal(resolveConfigPath(env), resolve('/tmp/autopilot.json'));
});

test('resolveWorkspaceDir uses override', () => {
  const env = { AUTOPILOT_WORKSPACE: '/tmp/autopilot-workspace' } as NodeJS.ProcessEnv;
  assert.equal(resolveWorkspaceDir(env), resolve('/tmp/autopilot-workspace'));
});
