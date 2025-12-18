/**
 * Parish Isolation Tests
 *
 * Critical security tests to ensure that users can only access data from their own parish.
 *
 * This test suite:
 * 1. Creates two separate parishes (Parish A and Parish B)
 * 2. Creates a user for each parish
 * 3. Creates test data in each parish
 * 4. Verifies that users can only see their own parish's data
 * 5. Tests all primary and supporting modules
 * 6. Cleans up all test data after completion
 *
 * Note: This test does NOT use the standard auth.setup.ts because it needs
 * to test multiple users across multiple parishes.
 */

import { test, expect } from '@playwright/test';
import { createClient } from '@supabase/supabase-js';
import { TEST_TIMEOUTS } from './utils/test-config';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

interface TestParish {
  parishId: string;
  userId: string;
  email: string;
  password: string;
  parishName: string;
}

let parishA: TestParish;
let parishB: TestParish;

// Test data IDs for cleanup
const testDataIds = {
  parishA: {
    weddings: [] as string[],
    funerals: [] as string[],
    baptisms: [] as string[],
    presentations: [] as string[],
    quinceaneras: [] as string[],
    masses: [] as string[],
    massIntentions: [] as string[],
    people: [] as string[],
    events: [] as string[],
    locations: [] as string[],
    groups: [] as string[],
    readings: [] as string[],
  },
  parishB: {
    weddings: [] as string[],
    funerals: [] as string[],
    baptisms: [] as string[],
    presentations: [] as string[],
    quinceaneras: [] as string[],
    masses: [] as string[],
    massIntentions: [] as string[],
    people: [] as string[],
    events: [] as string[],
    locations: [] as string[],
    groups: [] as string[],
    readings: [] as string[],
  },
};

test.describe.serial('Parish Isolation', () => {
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false }
  });

  // Helper function to login and handle parish selection
  async function loginAsParish(page: any, email: string, password: string) {
    await page.goto('/login');
    await page.fill('input[type="email"]', email);
    await page.fill('input[type="password"]', password);
    await page.click('button[type="submit"]');

    // Handle potential redirect to select-parish page
    if (page.url().includes('/select-parish')) {
      console.log(`   Selecting parish for ${email}...`);
      // Click the first "Select Parish" button
      await page.locator('button:has-text("Select Parish")').first().click();
      await page.waitForURL('/dashboard', { timeout: TEST_TIMEOUTS.NAVIGATION });
    } else {
      await page.waitForURL('/dashboard', { timeout: TEST_TIMEOUTS.EXTENDED });
    }
  }

  test.beforeAll(async () => {
    console.log('\n🏗️  Setting up two parishes with separate users...\n');

    const timestamp = Date.now();
    const randomA = Math.floor(Math.random() * 10000);
    const randomB = Math.floor(Math.random() * 10000);

    // Create Parish A
    const emailA = `test-parish-a-${timestamp}-${randomA}@outwardsign.test`;
    const passwordA = 'TestPassword123!';
    const parishNameA = `Test Parish A ${timestamp}`;

    console.log(`   Creating Parish A: ${parishNameA}`);
    console.log(`   User A: ${emailA}`);

    const { data: authUserA, error: authErrorA } = await supabase.auth.admin.createUser({
      email: emailA,
      password: passwordA,
      email_confirm: true,
    });

    if (authErrorA || !authUserA.user) {
      throw new Error(`Failed to create auth user A: ${authErrorA?.message}`);
    }

    const { data: createdParishA, error: parishErrorA } = await supabase
      .from('parishes')
      .insert({ name: parishNameA, city: 'Test City A', state: 'TA' })
      .select()
      .single();

    if (parishErrorA || !createdParishA) {
      throw new Error(`Failed to create parish A: ${parishErrorA?.message}`);
    }

    await supabase.from('parish_users').insert({
      parish_id: createdParishA.id,
      user_id: authUserA.user.id,
      roles: ['admin'],
    });

    await supabase.from('user_settings').insert({
      user_id: authUserA.user.id,
      selected_parish_id: createdParishA.id,
      language: 'en',
    });

    // Create default group roles for Parish A
    await supabase.from('group_roles').insert([
      { parish_id: createdParishA.id, name: 'LECTOR', description: 'Proclaims the Word of God during liturgies' },
      { parish_id: createdParishA.id, name: 'EMHC', description: 'Extraordinary Minister of Holy Communion' },
      { parish_id: createdParishA.id, name: 'ALTAR_SERVER', description: 'Assists the priest during Mass' },
      { parish_id: createdParishA.id, name: 'CANTOR', description: 'Leads the congregation in singing' },
      { parish_id: createdParishA.id, name: 'USHER', description: 'Welcomes parishioners and assists with seating' },
      { parish_id: createdParishA.id, name: 'SACRISTAN', description: 'Prepares the church for Mass' },
      { parish_id: createdParishA.id, name: 'MUSIC_MINISTER', description: 'Provides music for liturgies' }
    ]);

    parishA = {
      parishId: createdParishA.id,
      userId: authUserA.user.id,
      email: emailA,
      password: passwordA,
      parishName: parishNameA,
    };

    console.log(`   ✅ Parish A created: ${parishA.parishId}\n`);

    // Create Parish B
    const emailB = `test-parish-b-${timestamp}-${randomB}@outwardsign.test`;
    const passwordB = 'TestPassword123!';
    const parishNameB = `Test Parish B ${timestamp}`;

    console.log(`   Creating Parish B: ${parishNameB}`);
    console.log(`   User B: ${emailB}`);

    const { data: authUserB, error: authErrorB } = await supabase.auth.admin.createUser({
      email: emailB,
      password: passwordB,
      email_confirm: true,
    });

    if (authErrorB || !authUserB.user) {
      throw new Error(`Failed to create auth user B: ${authErrorB?.message}`);
    }

    const { data: createdParishB, error: parishErrorB } = await supabase
      .from('parishes')
      .insert({ name: parishNameB, city: 'Test City B', state: 'TB' })
      .select()
      .single();

    if (parishErrorB || !createdParishB) {
      throw new Error(`Failed to create parish B: ${parishErrorB?.message}`);
    }

    await supabase.from('parish_users').insert({
      parish_id: createdParishB.id,
      user_id: authUserB.user.id,
      roles: ['admin'],
    });

    await supabase.from('user_settings').insert({
      user_id: authUserB.user.id,
      selected_parish_id: createdParishB.id,
      language: 'en',
    });

    // Create default group roles for Parish B
    await supabase.from('group_roles').insert([
      { parish_id: createdParishB.id, name: 'LECTOR', description: 'Proclaims the Word of God during liturgies' },
      { parish_id: createdParishB.id, name: 'EMHC', description: 'Extraordinary Minister of Holy Communion' },
      { parish_id: createdParishB.id, name: 'ALTAR_SERVER', description: 'Assists the priest during Mass' },
      { parish_id: createdParishB.id, name: 'CANTOR', description: 'Leads the congregation in singing' },
      { parish_id: createdParishB.id, name: 'USHER', description: 'Welcomes parishioners and assists with seating' },
      { parish_id: createdParishB.id, name: 'SACRISTAN', description: 'Prepares the church for Mass' },
      { parish_id: createdParishB.id, name: 'MUSIC_MINISTER', description: 'Provides music for liturgies' }
    ]);

    parishB = {
      parishId: createdParishB.id,
      userId: authUserB.user.id,
      email: emailB,
      password: passwordB,
      parishName: parishNameB,
    };

    console.log(`   ✅ Parish B created: ${parishB.parishId}\n`);
  });

  test.afterAll(async () => {
    console.log('\n🧹 Cleaning up parish isolation test data...\n');

    try {
      // Clean up Parish A data
      await supabase.from('weddings').delete().eq('parish_id', parishA.parishId);
      await supabase.from('funerals').delete().eq('parish_id', parishA.parishId);
      await supabase.from('baptisms').delete().eq('parish_id', parishA.parishId);
      await supabase.from('presentations').delete().eq('parish_id', parishA.parishId);
      await supabase.from('quinceaneras').delete().eq('parish_id', parishA.parishId);
      await supabase.from('masses').delete().eq('parish_id', parishA.parishId);
      await supabase.from('mass_intentions').delete().eq('parish_id', parishA.parishId);
      await supabase.from('people').delete().eq('parish_id', parishA.parishId);
      await supabase.from('events').delete().eq('parish_id', parishA.parishId);
      await supabase.from('locations').delete().eq('parish_id', parishA.parishId);
      await supabase.from('groups').delete().eq('parish_id', parishA.parishId);
      await supabase.from('individual_readings').delete().eq('parish_id', parishA.parishId);
      await supabase.from('group_roles').delete().eq('parish_id', parishA.parishId);
      await supabase.from('parish_users').delete().eq('user_id', parishA.userId);
      await supabase.from('user_settings').delete().eq('user_id', parishA.userId);
      await supabase.from('parish_settings').delete().eq('parish_id', parishA.parishId);
      await supabase.from('parishes').delete().eq('id', parishA.parishId);
      await supabase.auth.admin.deleteUser(parishA.userId);

      // Clean up Parish B data
      await supabase.from('weddings').delete().eq('parish_id', parishB.parishId);
      await supabase.from('funerals').delete().eq('parish_id', parishB.parishId);
      await supabase.from('baptisms').delete().eq('parish_id', parishB.parishId);
      await supabase.from('presentations').delete().eq('parish_id', parishB.parishId);
      await supabase.from('quinceaneras').delete().eq('parish_id', parishB.parishId);
      await supabase.from('masses').delete().eq('parish_id', parishB.parishId);
      await supabase.from('mass_intentions').delete().eq('parish_id', parishB.parishId);
      await supabase.from('people').delete().eq('parish_id', parishB.parishId);
      await supabase.from('events').delete().eq('parish_id', parishB.parishId);
      await supabase.from('locations').delete().eq('parish_id', parishB.parishId);
      await supabase.from('groups').delete().eq('parish_id', parishB.parishId);
      await supabase.from('individual_readings').delete().eq('parish_id', parishB.parishId);
      await supabase.from('group_roles').delete().eq('parish_id', parishB.parishId);
      await supabase.from('parish_users').delete().eq('user_id', parishB.userId);
      await supabase.from('user_settings').delete().eq('user_id', parishB.userId);
      await supabase.from('parish_settings').delete().eq('parish_id', parishB.parishId);
      await supabase.from('parishes').delete().eq('id', parishB.parishId);
      await supabase.auth.admin.deleteUser(parishB.userId);

      console.log('   ✅ All test data cleaned up successfully\n');
    } catch (error) {
      console.error('   ❌ Error during cleanup:', error);
    }
  });

  test('should isolate weddings by parish', async ({ browser }) => {
    // Create wedding directly in database for Parish A
    const { data: wedding, error } = await supabase
      .from('weddings')
      .insert({ parish_id: parishA.parishId, status: 'ACTIVE', notes: 'Wedding for Parish A' })
      .select()
      .single();

    if (error || !wedding) {
      throw new Error(`Failed to create wedding: ${error?.message}`);
    }

    const weddingIdA = wedding.id;
    testDataIds.parishA.weddings.push(weddingIdA);
    console.log(`   Created wedding ${weddingIdA} for Parish A`);

    // Login as Parish B user and verify they can't see Parish A's wedding
    const contextB = await browser.newContext({ storageState: undefined });
    const pageB = await contextB.newPage();

    await loginAsParish(pageB, parishB.email, parishB.password);

    // Try to navigate to Parish A's wedding directly
    await pageB.goto(`/weddings/${weddingIdA}`);

    // The page may stay at the wedding URL, but the wedding data should NOT be visible
    // because RLS prevents Parish B from reading Parish A's data
    const currentUrl = pageB.url();
    console.log(`   Parish B attempted to access wedding ${weddingIdA}, current URL: ${currentUrl}`);

    // Check that the wedding details from Parish A are NOT visible
    // The page should either show an error, or be blank/loading state
    const notesVisible = await pageB.getByText('Wedding for Parish A').isVisible().catch(() => false);
    expect(notesVisible).toBe(false); // Should NOT see Parish A's wedding notes

    // Verify Parish B's wedding list shows no weddings from Parish A
    await pageB.goto('/weddings');

    // Should either show "no weddings found" or just not show Parish A's wedding
    const parishAWeddingInList = await pageB.locator(`[data-testid="wedding-${weddingIdA}"]`).isVisible().catch(() => false);
    expect(parishAWeddingInList).toBe(false); // Should NOT see Parish A's wedding in the list

    await contextB.close();
  });

  test('should isolate funerals by parish', async ({ browser }) => {
    // Create funeral directly in database for Parish A
    const { data: funeral, error } = await supabase
      .from('funerals')
      .insert({ parish_id: parishA.parishId, status: 'ACTIVE', note: 'Funeral for Parish A' })
      .select()
      .single();

    if (error || !funeral) {
      throw new Error(`Failed to create funeral: ${error?.message}`);
    }

    const funeralIdA = funeral.id;
    testDataIds.parishA.funerals.push(funeralIdA);
    console.log(`   Created funeral ${funeralIdA} for Parish A`);

    // Login as Parish B user and verify they can't see Parish A's funeral
    const contextB = await browser.newContext({ storageState: undefined });
    const pageB = await contextB.newPage();

    await loginAsParish(pageB, parishB.email, parishB.password);

    await pageB.goto(`/funerals/${funeralIdA}`);

    // Check that Parish A's funeral data is NOT visible to Parish B
    const noteVisible = await pageB.getByText('Funeral for Parish A').isVisible().catch(() => false);
    expect(noteVisible).toBe(false);

    // Verify Parish B's funeral list doesn't show Parish A's funeral
    await pageB.goto('/funerals');
    const parishAFuneralInList = await pageB.locator(`[data-testid="funeral-${funeralIdA}"]`).isVisible().catch(() => false);
    expect(parishAFuneralInList).toBe(false);

    await contextB.close();
  });

  test('should isolate baptisms by parish', async ({ browser }) => {
    // Create baptism directly in database for Parish A
    const { data: baptism, error } = await supabase
      .from('baptisms')
      .insert({ parish_id: parishA.parishId, status: 'ACTIVE', note: 'Baptism for Parish A' })
      .select()
      .single();

    if (error || !baptism) {
      throw new Error(`Failed to create baptism: ${error?.message}`);
    }

    const baptismIdA = baptism.id;
    testDataIds.parishA.baptisms.push(baptismIdA);
    console.log(`   Created baptism ${baptismIdA} for Parish A`);

    const contextB = await browser.newContext({ storageState: undefined });
    const pageB = await contextB.newPage();

    await loginAsParish(pageB, parishB.email, parishB.password);

    // Verify Parish B cannot see Parish A's baptism in the list
    await pageB.goto('/baptisms');
    const parishABaptismInList = await pageB.locator(`[data-testid="baptism-${baptismIdA}"]`).isVisible().catch(() => false);
    expect(parishABaptismInList).toBe(false);

    await contextB.close();
  });

  test('should isolate presentations by parish', async ({ browser }) => {
    // Create presentation directly in database for Parish A
    const { data: presentation, error } = await supabase
      .from('presentations')
      .insert({ parish_id: parishA.parishId, status: 'ACTIVE', note: 'Presentation for Parish A' })
      .select()
      .single();

    if (error || !presentation) {
      throw new Error(`Failed to create presentation: ${error?.message}`);
    }

    const presentationIdA = presentation.id;
    testDataIds.parishA.presentations.push(presentationIdA);
    console.log(`   Created presentation ${presentationIdA} for Parish A`);

    const contextB = await browser.newContext({ storageState: undefined });
    const pageB = await contextB.newPage();

    await loginAsParish(pageB, parishB.email, parishB.password);

    // Verify Parish B cannot see Parish A's presentation in the list
    await pageB.goto('/presentations');
    const parishAPresentationInList = await pageB.locator(`[data-testid="presentation-${presentationIdA}"]`).isVisible().catch(() => false);
    expect(parishAPresentationInList).toBe(false);

    await contextB.close();
  });

  test('should isolate quinceaneras by parish', async ({ browser }) => {
    // Create quinceanera directly in database for Parish A
    const { data: quinceanera, error } = await supabase
      .from('quinceaneras')
      .insert({ parish_id: parishA.parishId, status: 'ACTIVE', note: 'Quinceanera for Parish A' })
      .select()
      .single();

    if (error || !quinceanera) {
      throw new Error(`Failed to create quinceanera: ${error?.message}`);
    }

    const quinceaneraIdA = quinceanera.id;
    testDataIds.parishA.quinceaneras.push(quinceaneraIdA);
    console.log(`   Created quinceanera ${quinceaneraIdA} for Parish A`);

    const contextB = await browser.newContext({ storageState: undefined });
    const pageB = await contextB.newPage();

    await loginAsParish(pageB, parishB.email, parishB.password);

    // Verify Parish B cannot see Parish A's quinceanera in the list
    await pageB.goto('/quinceaneras');
    const parishAQuinceaneraInList = await pageB.locator(`[data-testid="quinceanera-${quinceaneraIdA}"]`).isVisible().catch(() => false);
    expect(parishAQuinceaneraInList).toBe(false);

    await contextB.close();
  });

  test('should isolate masses by parish', async ({ browser }) => {
    const { data: mass, error } = await supabase
      .from('masses')
      .insert({ parish_id: parishA.parishId, note: 'Mass for Parish A' })
      .select()
      .single();

    if (error || !mass) throw new Error(`Failed to create mass: ${error?.message}`);

    const massIdA = mass.id;
    testDataIds.parishA.masses.push(massIdA);

    const contextB = await browser.newContext({ storageState: undefined });
    const pageB = await contextB.newPage();
    await loginAsParish(pageB, parishB.email, parishB.password);

    await pageB.goto('/masses');
    const parishAMassInList = await pageB.locator(`[data-testid="mass-${massIdA}"]`).isVisible().catch(() => false);
    expect(parishAMassInList).toBe(false);

    await contextB.close();
  });

  test('should isolate mass intentions by parish', async ({ browser }) => {
    const { data: massIntention, error } = await supabase
      .from('mass_intentions')
      .insert({ parish_id: parishA.parishId, mass_offered_for: 'John Doe', note: 'Mass Intention for Parish A' })
      .select()
      .single();

    if (error || !massIntention) throw new Error(`Failed to create mass intention: ${error?.message}`);

    const massIntentionIdA = massIntention.id;
    testDataIds.parishA.massIntentions.push(massIntentionIdA);

    const contextB = await browser.newContext({ storageState: undefined });
    const pageB = await contextB.newPage();
    await loginAsParish(pageB, parishB.email, parishB.password);

    await pageB.goto('/mass-intentions');
    const parishAMassIntentionInList = await pageB.locator(`[data-testid="mass-intention-${massIntentionIdA}"]`).isVisible().catch(() => false);
    expect(parishAMassIntentionInList).toBe(false);

    await contextB.close();
  });

  test('should isolate people by parish', async ({ browser }) => {
    const { data: person, error } = await supabase
      .from('people')
      .insert({ parish_id: parishA.parishId, first_name: 'John', last_name: 'Smith' })
      .select()
      .single();

    if (error || !person) throw new Error(`Failed to create person: ${error?.message}`);

    const personIdA = person.id;
    testDataIds.parishA.people.push(personIdA);

    const contextB = await browser.newContext({ storageState: undefined });
    const pageB = await contextB.newPage();
    await loginAsParish(pageB, parishB.email, parishB.password);

    await pageB.goto('/people');
    const parishAPersonInList = await pageB.locator(`[data-testid="person-${personIdA}"]`).isVisible().catch(() => false);
    expect(parishAPersonInList).toBe(false);

    await contextB.close();
  });

  test('should isolate events by parish', async ({ browser }) => {
    const { data: event, error } = await supabase
      .from('events')
      .insert({ parish_id: parishA.parishId, name: 'Parish A Event' })
      .select()
      .single();

    if (error || !event) throw new Error(`Failed to create event: ${error?.message}`);

    const eventIdA = event.id;
    testDataIds.parishA.events.push(eventIdA);

    const contextB = await browser.newContext({ storageState: undefined });
    const pageB = await contextB.newPage();
    await loginAsParish(pageB, parishB.email, parishB.password);

    await pageB.goto('/events');
    const parishAEventInList = await pageB.locator(`[data-testid="event-${eventIdA}"]`).isVisible().catch(() => false);
    expect(parishAEventInList).toBe(false);

    await contextB.close();
  });

  test('should isolate locations by parish', async ({ browser }) => {
    const { data: location, error } = await supabase
      .from('locations')
      .insert({ parish_id: parishA.parishId, name: 'Parish A Chapel' })
      .select()
      .single();

    if (error || !location) throw new Error(`Failed to create location: ${error?.message}`);

    const locationIdA = location.id;
    testDataIds.parishA.locations.push(locationIdA);

    const contextB = await browser.newContext({ storageState: undefined });
    const pageB = await contextB.newPage();
    await loginAsParish(pageB, parishB.email, parishB.password);

    await pageB.goto('/locations');
    const parishALocationInList = await pageB.locator(`[data-testid="location-${locationIdA}"]`).isVisible().catch(() => false);
    expect(parishALocationInList).toBe(false);

    await contextB.close();
  });

  test('should isolate readings by parish', async ({ browser }) => {
    const { data: reading, error } = await supabase
      .from('readings')
      .insert({
        parish_id: parishA.parishId,
        pericope: 'John 3:16',
        text: 'For God so loved the world',
        language: 'ENGLISH'
      })
      .select()
      .single();

    if (error || !reading) throw new Error(`Failed to create reading: ${error?.message}`);

    const readingIdA = reading.id;
    testDataIds.parishA.readings.push(readingIdA);

    const contextB = await browser.newContext({ storageState: undefined });
    const pageB = await contextB.newPage();
    await loginAsParish(pageB, parishB.email, parishB.password);

    await pageB.goto('/readings');
    const john316Visible = await pageB.getByText('John 3:16').isVisible().catch(() => false);
    expect(john316Visible).toBe(false);

    await contextB.close();
  });
});
