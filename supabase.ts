import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ykhrfruybykzhinpnygi.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlraHJmcnV5YnlremhpbnBueWdpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIzNzg2NjgsImV4cCI6MjA4Nzk1NDY2OH0.zyyd_3XSYVnnleRxqhNfIsFJBRfGFGRctwPir8r1EHM';

export const supabase = createClient(supabaseUrl, supabaseKey);