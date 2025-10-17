const truthy = (v) => /^(1|true|yes|on)$/i.test(String(v ?? '').trim());

const enabled = truthy(process.env.ADMIN_AUTH ?? process.env.ADMIN_AUTH_ENABLED);

const username = process.env.ADMIN_USERNAME || 'admin';
const passwordHash = process.env.ADMIN_PASSWORD_HASH || '';
const permissions = process.env.ADMIN_PERMISSIONS || '*';

// Configure adminAuth from environment when enabled and properly configured.
// Falls back to no auth if not enabled or missing values.
const fragment = {};
if (enabled && username && passwordHash) {
  fragment.adminAuth = {
    type: 'credentials',
    users: [
      {
        username,
        password: passwordHash,
        permissions,
      },
    ],
  };
}

export default fragment;

