import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '../../../lib/supabase'

// Helper function to verify admin session
async function verifyAdminSession(sessionToken: string) {
  const { data: session, error } = await supabase
    .from('admin_sessions')
    .select('user_id')
    .eq('session_token', sessionToken)
    .gt('expires_at', new Date().toISOString())
    .single()

  return !error && session
}

const samplePosts = [
  // Latest News
  {
    title: "Nepal's Tourism Industry Shows Strong Recovery Signs",
    summary: "Tourist arrivals increase by 40% this quarter compared to last year, indicating strong recovery post-pandemic.",
    content: `Nepal's tourism industry is showing remarkable signs of recovery with a 40% increase in tourist arrivals this quarter compared to the same period last year. 

The Nepal Tourism Board reports that over 200,000 international visitors have entered the country in the past three months, with October being the peak month for mountaineering expeditions.

Key highlights include:
- Increased bookings for trekking routes including Everest Base Camp and Annapurna Circuit
- Revival of cultural tourism with more visitors to Kathmandu Valley's UNESCO World Heritage sites
- Growth in adventure tourism activities like paragliding, bungee jumping, and white-water rafting

Tourism Minister stated that the government is working on infrastructure improvements and promotional campaigns to sustain this positive trend.`,
    category: "latest",
    image_url: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2342&q=80"
  },
  {
    title: "New Hydropower Project Inaugurated in Western Nepal",
    summary: "The 50MW hydropower plant will provide clean energy to over 100,000 households in the region.",
    content: `A new 50-megawatt hydropower project has been officially inaugurated in Kaski district, marking another milestone in Nepal's journey toward energy self-sufficiency.

The project, built with an investment of NPR 8 billion, is expected to generate approximately 280 million units of electricity annually. This will significantly contribute to reducing load-shedding issues in the western region.

Project Features:
- State-of-the-art turbines imported from Germany
- Environmentally sustainable design with minimal ecological impact
- Employment generation for over 200 local residents during construction phase
- Expected operational life of 80+ years

The Prime Minister, who attended the inauguration ceremony, emphasized the importance of harnessing Nepal's vast hydropower potential for economic development.`,
    category: "latest",
    image_url: "https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2340&q=80"
  },

  // Breaking News
  {
    title: "BREAKING: Major Earthquake Hits Central Nepal",
    summary: "6.2 magnitude earthquake strikes central Nepal, tremors felt across the region. Emergency response teams deployed.",
    content: `A powerful earthquake measuring 6.2 on the Richter scale struck central Nepal at 3:45 PM local time today, causing widespread panic and minor damages across several districts.

The epicenter was located in Dhading district, approximately 80 kilometers northwest of Kathmandu. Tremors were felt strongly in Kathmandu, Pokhara, and other major cities.

Current Situation:
- No major casualties reported so far
- Several old buildings suffered minor cracks
- Power outages in some areas of Kathmandu
- Transportation services temporarily disrupted

The National Emergency Operation Center has been activated, and search and rescue teams are on standby. Citizens are advised to stay in open areas and follow safety protocols.

This is the strongest earthquake to hit Nepal since the 2015 devastating quake that claimed thousands of lives.`,
    category: "breaking",
    image_url: "https://images.unsplash.com/photo-1594736797933-d0fa2fe2c813?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2342&q=80"
  },
  {
    title: "BREAKING: Nepal Announces Free WiFi in All Tourist Areas",
    summary: "Government launches ambitious plan to provide high-speed internet access in major tourist destinations nationwide.",
    content: `The Nepal government has announced an ambitious initiative to provide free high-speed WiFi access in all major tourist destinations across the country, effective from next month.

The program, with a budget allocation of NPR 2 billion, aims to enhance the tourist experience and boost digital connectivity in remote areas.

Coverage Areas Include:
- All trekking routes including Everest and Annapurna regions
- Major cities: Kathmandu, Pokhara, Chitwan, Lumbini
- Airport terminals and transportation hubs
- Hotels and restaurants in tourist zones

The Minister of Communications announced that the infrastructure setup is 90% complete, with fiber optic cables laid across mountain regions using innovative drone technology.

This initiative is expected to significantly improve Nepal's ranking in global digital connectivity indices and attract more international visitors.`,
    category: "breaking",
    image_url: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2372&q=80"
  },

  // Politics
  {
    title: "Parliament Passes Historic Environmental Protection Act",
    summary: "New legislation introduces stricter regulations on pollution and deforestation, with severe penalties for violations.",
    content: `The Nepal Parliament has unanimously passed the Environmental Protection Act 2024, marking a significant step toward sustainable development and climate action.

The comprehensive legislation introduces stringent measures to combat pollution, protect forests, and preserve biodiversity across the nation.

Key Provisions:
- Mandatory environmental impact assessments for all major projects
- Heavy fines up to NPR 10 million for pollution violations
- Ban on single-use plastics in urban areas by 2025
- Protection of 30% of Nepal's land as conservation areas
- Incentives for renewable energy adoption

The bill received support from all political parties, reflecting a rare moment of unity on environmental issues. Environmental activists have praised the legislation as a "game-changer" for Nepal's ecological future.

Implementation will begin within six months, with dedicated enforcement teams established in all 77 districts.`,
    category: "politics",
    image_url: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2371&q=80"
  },
  {
    title: "Opposition Parties Form Coalition Against Proposed Tax Reforms",
    summary: "Major opposition parties unite to challenge government's new taxation policy, calling it 'anti-people'.",
    content: `Nepal's major opposition parties have formed a united coalition to oppose the government's proposed tax reform package, scheduled for parliamentary debate next week.

The coalition, comprising five parties, argues that the new tax structure will disproportionately burden middle-class families and small businesses.

Contested Proposals:
- 15% VAT on essential goods currently exempt
- Income tax increase for middle-income brackets
- New digital services tax affecting online businesses
- Property tax hikes in urban areas

Opposition leaders held a joint press conference demanding immediate withdrawal of the proposals. They've announced a series of peaceful protests and parliamentary procedures to block the legislation.

The Finance Minister defended the reforms as "necessary for economic stability" and promised to address concerns through dialogue. Political analysts predict intense parliamentary sessions ahead.`,
    category: "politics",
    image_url: "https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2370&q=80"
  },

  // Sports
  {
    title: "Nepal Wins Gold at South Asian Cricket Championship",
    summary: "National cricket team defeats India in thrilling final match to claim first-ever regional championship title.",
    content: `Nepal's national cricket team has achieved a historic milestone by winning the South Asian Cricket Championship, defeating India by 6 wickets in a thrilling final match played in Colombo.

This marks Nepal's first major regional cricket championship victory, sending the entire nation into celebration mode.

Match Highlights:
- Nepal successfully chased down India's target of 267 runs
- Captain Rohit Paudel scored an unbeaten 89 runs
- Sandeep Lamichhane took 4 crucial wickets
- Partnership of 156 runs between Paudel and Aarif Sheikh

The victory comes after years of consistent performance improvements and investment in cricket infrastructure. The team's coach credited the win to "dedicated training and unwavering team spirit."

Prime Minister congratulated the team and announced cash rewards of NPR 1 million for each player. The team is expected to receive a hero's welcome upon their return to Kathmandu.`,
    category: "sports",
    image_url: "https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2305&q=80"
  },
  {
    title: "Nepali Mountaineer Sets New Everest Speed Climbing Record",
    summary: "Tenjing Sherpa completes Everest ascent in record-breaking 10 hours and 56 minutes, surpassing previous record.",
    content: `Tenjing Sherpa, a veteran Nepali mountaineer, has shattered the speed climbing record for Mount Everest by completing the ascent from base camp to summit in just 10 hours and 56 minutes.

The previous record of 12 hours and 15 minutes had stood for three years. Sherpa's achievement showcases exceptional physical fitness and intimate knowledge of the mountain.

Record Details:
- Started ascent at 2:30 AM from Base Camp
- Reached summit at 1:26 PM the same day
- Used supplemental oxygen only above 8,000 meters
- Favorable weather conditions throughout the climb

This is Sherpa's 15th successful Everest summit, and he dedicated the record to his late father who was also a renowned climber. International mountaineering organizations have officially recognized the achievement.

The feat highlights the exceptional skills of Nepali climbers and their deep connection with the world's highest peaks.`,
    category: "sports",
    image_url: "https://images.unsplash.com/photo-1551524164-687a55dd1126?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2339&q=80"
  },

  // Business
  {
    title: "Nepal Stock Exchange Hits All-Time High",
    summary: "NEPSE index crosses 3,000 points for the first time, driven by strong banking and hydropower sector performance.",
    content: `The Nepal Stock Exchange (NEPSE) has achieved a historic milestone by crossing the 3,000-point mark for the first time in its history, reflecting robust investor confidence in the country's economic prospects.

The index closed at 3,045.67 points, representing a 4.2% increase from the previous day's trading session.

Market Performance Highlights:
- Banking sector gained 6.8%, leading the rally
- Hydropower stocks surged 5.4% on new project announcements  
- Manufacturing index up 3.2% on export growth optimism
- Foreign investment increased by 45% this quarter

Market analysts attribute the surge to improved macroeconomic indicators, political stability, and positive investor sentiment following recent policy reforms.

The milestone has attracted attention from international investment firms, with several expressing interest in Nepal's emerging market opportunities.

Trading volume reached NPR 12.8 billion, the highest single-day volume recorded this year.`,
    category: "business",
    image_url: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2370&q=80"
  },
  {
    title: "Major Indian IT Company Opens Development Center in Kathmandu",
    summary: "Tech giant announces NPR 5 billion investment to establish regional headquarters, creating 2,000 jobs.",
    content: `A leading Indian IT services company has announced plans to establish a major software development center in Kathmandu, marking the largest foreign direct investment in Nepal's technology sector.

The NPR 5 billion investment will create approximately 2,000 high-skilled jobs over the next three years, significantly boosting Nepal's IT industry.

Project Details:
- 200,000 sq ft modern facility in Kathmandu IT Park
- Focus on software development, data analytics, and AI research
- Partnership with local universities for talent development
- Plans to serve clients across Asia-Pacific region

The announcement comes as Nepal positions itself as an attractive destination for IT outsourcing, leveraging its skilled English-speaking workforce and competitive costs.

Government officials welcomed the investment as a major step toward transforming Nepal into a regional technology hub. The company plans to begin operations by early next year.`,
    category: "business",
    image_url: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2370&q=80"
  },

  // Entertainment
  {
    title: "Nepali Film 'Himalayan Dreams' Selected for Cannes Film Festival",
    summary: "Independent filmmaker's debut feature becomes first Nepali movie to compete in prestigious international festival.",
    content: `A groundbreaking achievement for Nepali cinema as 'Himalayan Dreams', directed by emerging filmmaker Sujata Koirala, has been selected for the Un Certain Regard section at the Cannes Film Festival.

This marks the first time a Nepali film has been accepted into the prestigious festival's official selection, putting Nepal on the global cinema map.

Film Highlights:
- Shot entirely in rural Nepal with local non-professional actors
- Explores themes of migration, tradition, and modernity
- Produced on a budget of NPR 2.5 million through crowdfunding
- Features stunning cinematography of Himalayan landscapes

Director Koirala, a graduate of film school in Prague, spent three years developing the project. The film tells the story of a young woman torn between urban opportunities and village responsibilities.

International critics have praised the film's authentic storytelling and visual poetry. The Cannes selection is expected to open doors for more Nepali filmmakers on the international stage.`,
    category: "entertainment",
    image_url: "https://images.unsplash.com/photo-1489599856826-2b3d0d4e84c1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2372&q=80"
  },
  {
    title: "International Music Festival Brings Global Artists to Kathmandu",
    summary: "Three-day cultural extravaganza features performers from 15 countries, celebrating diversity and unity through music.",
    content: `The inaugural Kathmandu World Music Festival has transformed the capital into a vibrant cultural hub, featuring artists from 15 countries performing across multiple venues throughout the city.

The three-day festival has attracted music enthusiasts from across South Asia, showcasing diverse genres from traditional folk to contemporary fusion.

Festival Highlights:
- Performances at historic venues including Durbar Square and Patan Museum
- Collaboration between Nepali and international artists
- Workshops on traditional instruments and music production
- Food courts featuring cuisines from participating countries

Notable performances include Indian classical fusion, African drums, European folk, and Latin American rhythms, creating a unique multicultural experience.

The festival has been praised for promoting cultural exchange and positioning Kathmandu as a regional cultural destination. Organizers announced plans to make it an annual event, with next year's edition expanding to include more countries and venues.`,
    category: "entertainment",
    image_url: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2370&q=80"
  }
];

export async function POST(request: NextRequest) {
  try {
    const sessionToken = request.cookies.get('admin_session')?.value

    if (!sessionToken || !(await verifyAdminSession(sessionToken))) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // First, try to add the category column if it doesn't exist
    console.log('Starting migration: Adding category column and sample data')

    // Insert sample posts
    const { data, error } = await supabase
      .from('news_posts')
      .insert(samplePosts)
      .select()

    if (error) {
      console.error('Migration error:', error)
      return NextResponse.json(
        { error: `Migration failed: ${error.message}` },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: `Migration completed successfully. Added ${data.length} sample posts.`,
      insertedPosts: data.length
    })

  } catch (error) {
    console.error('Migration route error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}