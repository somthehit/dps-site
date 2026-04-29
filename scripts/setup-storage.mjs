import postgres from 'postgres';

const sql = postgres(process.env.DATABASE_URL);

async function setup() {
  try {
    await sql`
      insert into storage.buckets (id, name, public)
      values ('dps-assets', 'dps-assets', true)
      on conflict (id) do nothing;
    `;
    console.log('Bucket dps-assets created or already exists.');

    await sql`
      create policy "Public Access"
      on storage.objects for select
      to public
      using ( bucket_id = 'dps-assets' );
    `.catch(e => console.log('Policy Public Access:', e.message));

    await sql`
      create policy "Anon Insert"
      on storage.objects for insert
      to anon
      with check ( bucket_id = 'dps-assets' );
    `.catch(e => console.log('Policy Anon Insert:', e.message));

    await sql`
      create policy "Anon Update"
      on storage.objects for update
      to anon
      using ( bucket_id = 'dps-assets' );
    `.catch(e => console.log('Policy Anon Update:', e.message));

    await sql`
      create policy "Anon Delete"
      on storage.objects for delete
      to anon
      using ( bucket_id = 'dps-assets' );
    `.catch(e => console.log('Policy Anon Delete:', e.message));
    
    console.log('Policies created.');
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await sql.end();
  }
}

setup();
