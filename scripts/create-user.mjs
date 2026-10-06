import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error('Error: Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

async function run() {
  const email = 'junaiskandara@leadagent7.com';
  const password = 'Password1.';

  console.log(`Checking user: ${email}...`);

  // 1. Check if user already exists
  const { data: usersData, error: listErr } = await supabase.auth.admin.listUsers();
  if (listErr) {
    console.error('Failed to list users:', listErr.message);
    process.exit(1);
  }

  let user = usersData.users.find((u) => u.email?.toLowerCase() === email.toLowerCase());

  if (user) {
    console.log(`User found with ID: ${user.id}. Updating password...`);
    const { data: updated, error: updateErr } = await supabase.auth.admin.updateUserById(user.id, {
      password,
      email_confirm: true,
      user_metadata: { name: 'Junais Kandara' },
    });

    if (updateErr) {
      console.error('Failed to update user password:', updateErr.message);
      process.exit(1);
    }
    user = updated.user;
    console.log('Password successfully updated!');
  } else {
    console.log('User not found. Creating new user...');
    const { data: created, error: createErr } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { name: 'Junais Kandara' },
    });

    if (createErr) {
      console.error('Failed to create user:', createErr.message);
      process.exit(1);
    }
    user = created.user;
    console.log(`User created successfully with ID: ${user.id}!`);
  }

  // 2. Ensure an organization exists
  let { data: org } = await supabase
    .from('organizations')
    .select('id, name')
    .limit(1)
    .single();

  if (!org) {
    console.log('Creating default organization...');
    const { data: newOrg, error: orgErr } = await supabase
      .from('organizations')
      .insert({
        name: 'LeadAgent7 HQ',
        slug: 'leadagent7-hq',
        timezone: 'Asia/Dubai',
      })
      .select('id, name')
      .single();

    if (orgErr) {
      console.error('Failed to create organization:', orgErr.message);
      process.exit(1);
    }
    org = newOrg;
  }
  console.log(`Organization: ${org.name} (${org.id})`);

  // 3. Ensure user is an owner member in organization_members
  const { data: existingMember } = await supabase
    .from('organization_members')
    .select('id, role')
    .eq('organization_id', org.id)
    .eq('user_id', user.id)
    .single();

  if (existingMember) {
    console.log(`User is already an organization member with role: ${existingMember.role}`);
  } else {
    console.log('Adding user as organization owner...');
    const { error: memberErr } = await supabase.from('organization_members').insert({
      organization_id: org.id,
      user_id: user.id,
      role: 'owner',
    });

    if (memberErr) {
      console.error('Failed to add organization member:', memberErr.message);
      process.exit(1);
    }
    console.log('Successfully assigned owner role in organization_members!');
  }

  console.log('\n--- SUCCESS ---');
  console.log(`User: ${email}`);
  console.log(`Password: ${password}`);
  console.log(`User ID: ${user.id}`);
  console.log(`Org ID: ${org.id}`);
  console.log('Email confirmed: true');
}

run().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
