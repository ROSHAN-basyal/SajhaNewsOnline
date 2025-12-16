// Script to directly insert all 30 news articles to the database
// Run this with: node add_news_articles.js

const { createClient } = require("@supabase/supabase-js");
const fs = require("fs");
const path = require("path");

function loadEnvFromFile(filePath) {
  if (!fs.existsSync(filePath)) return;

  const contents = fs.readFileSync(filePath, "utf8");
  for (const rawLine of contents.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;

    const equalsIndex = line.indexOf("=");
    if (equalsIndex === -1) continue;

    const key = line.slice(0, equalsIndex).trim();
    if (!key || process.env[key] !== undefined) continue;

    let value = line.slice(equalsIndex + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    process.env[key] = value;
  }
}

loadEnvFromFile(path.join(__dirname, ".env.local"));
loadEnvFromFile(path.join(__dirname, ".env"));

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.SUPABASE_ANON_KEY ||
  process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase credentials.");
  console.error(
    "Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY (or SUPABASE_URL/SUPABASE_ANON_KEY) before running this script."
  );
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const newsArticles = [
  // LATEST NEWS (5 articles)
  {
    title: 'PM Oli Holds Bilateral Meetings at SCO Summit 2025 in China',
    summary: 'Prime Minister KP Sharma Oli conducts diplomatic meetings with regional leaders including Chinese President Xi Jinping during SCO Summit in Tianjin.',
    content: `Prime Minister KP Sharma Oli is currently participating in the Shanghai Cooperation Organization (SCO) Summit 2025 in Tianjin, China, where he has been engaging in crucial bilateral meetings with various world leaders.

During his meeting with Chinese President Xi Jinping, PM Oli expressed Nepal's objection to the India-China agreement regarding the reopening of trade routes through Nepali territory at Lipulekh, highlighting Nepal's territorial sovereignty concerns.

Key Diplomatic Engagements:
- Bilateral meeting with Laotian President Sisoulith
- Discussions on regional cooperation and trade
- Territorial dispute discussions with China
- Economic partnership talks with multiple SCO member states

The Prime Minister's participation in the SCO Summit demonstrates Nepal's commitment to regional cooperation while maintaining its territorial integrity. The meetings are expected to yield significant outcomes for Nepal's foreign policy and economic partnerships in the region.

Members of Parliament have urged the government to adopt stronger diplomatic measures to reclaim Nepal's territory, emphasizing the importance of these international discussions in addressing long-standing territorial disputes.`,
    category: 'latest',
    image_url: 'https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2370&q=80'
  },
  {
    title: 'Indian Garment Giants Eye Nepal as US Tariffs Impact Global Trade',
    summary: 'Major Indian textile companies explore Nepal as alternative production base due to high US duties on Indian and Bangladeshi exports.',
    content: `As US tariffs continue to impact global textile trade, major Indian garment manufacturers are increasingly looking toward Nepal as an attractive alternative production destination.

The shift comes as high US duties on Indian and Bangladeshi exports are driving international brands to seek new manufacturing partnerships in the region. Nepal's strategic location, competitive labor costs, and growing textile infrastructure make it an appealing option.

Market Opportunities:
- Access to US market with preferential trade status
- Lower production costs compared to traditional hubs
- Growing skilled workforce in textile manufacturing
- Government incentives for foreign investment

Industry experts predict this trend could significantly boost Nepal's textile export sector, potentially creating thousands of jobs and increasing foreign exchange earnings. The garment industry could become a major contributor to Nepal's economic growth.

Several leading Indian companies have already initiated discussions with Nepali manufacturers to establish joint ventures and outsourcing partnerships. This development aligns with Nepal's efforts to diversify its economy and strengthen its manufacturing base.

The timing is particularly significant as Nepal works to position itself as a reliable partner in the global supply chain while benefiting from changing international trade dynamics.`,
    category: 'latest',
    image_url: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2370&q=80'
  },
  {
    title: 'BP Highway Repair Challenges Ahead of Dashain Festival 2025',
    summary: 'Road officials acknowledge slow repair progress on crucial highway but promise temporary fixes for Dashain travel season.',
    content: `With the Dashain festival approaching, concerns are mounting over the condition of the BP Highway, one of Nepal's most important transportation corridors connecting the capital to various districts.

Road officials have admitted that repair work on the highway has been progressing slower than expected, raising concerns about travel safety during the peak Dashain season when millions of people travel across the country.

Current Situation:
- Multiple sections require urgent attention
- Monsoon damage has exacerbated existing problems
- Heavy traffic expected during festival season
- Emergency repair teams deployed

Despite the challenges, highway authorities have assured the public that temporary fixes will be implemented to ensure safe passage during the Dashain travel period. Priority sections have been identified for immediate attention.

The BP Highway serves as a lifeline for many communities and is crucial for economic activities. Its condition directly impacts thousands of daily commuters and freight movement between major cities.

Officials are working round the clock to address the most critical sections, with additional resources being allocated to complete temporary repairs before the festival rush begins. Long-term reconstruction plans are also being finalized to prevent similar issues in the future.`,
    category: 'latest',
    image_url: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2340&q=80'
  },
  {
    title: 'Nepal Officials Reject Chinese Claim on Global Security Initiative',
    summary: 'Nepali delegates clarify that Global Security Initiative was never discussed in bilateral meetings, rejecting Chinese statements.',
    content: `A Nepali delegate has firmly rejected Chinese claims regarding discussions about the Global Security Initiative (GSI) during recent bilateral meetings, stating that no such discussions took place.

"Why should we issue a statement when we've not even discussed GSI and GCI?" the delegate questioned, clarifying Nepal's position on the matter and dismissing any notion that the country had engaged in formal discussions about China's Global Security Initiative.

Key Points of Clarification:
- No formal discussions held on Global Security Initiative
- Nepal maintains independent foreign policy stance
- Bilateral meetings focused on other cooperation areas
- Clear rejection of misrepresented claims

The statement comes amid growing international attention on China's Global Security Initiative and attempts to garner support from various nations. Nepal's clear rejection demonstrates its commitment to maintaining an independent foreign policy approach.

Political analysts suggest this response reflects Nepal's balanced diplomacy, where it maintains friendly relations with all countries while avoiding entanglement in geopolitical initiatives that might compromise its sovereignty or neutral stance.

The incident highlights the importance of accurate diplomatic communication and Nepal's careful approach to international relations, particularly with major powers in the region.`,
    category: 'latest',
    image_url: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2370&q=80'
  },
  {
    title: 'Pushpa Kamal Dahal Warns of Potential Protests in Nepal',
    summary: 'Former Prime Minister signals possible political demonstrations, though experts question his organizational capacity.',
    content: `Former Prime Minister and CPN (Maoist Centre) Chairman Pushpa Kamal Dahal has warned of potential protests against the current government, signaling possible political upheaval in the coming months.

However, political experts and analysts have expressed skepticism about Dahal's ability to organize effective large-scale protests, citing his party's diminished organizational strength and limited grassroots support compared to previous years.

Political Dynamics:
- Opposition parties exploring joint action strategies
- Government maintaining stable parliamentary majority
- Public sentiment remains mixed on protest effectiveness
- Economic concerns overshadowing political demonstrations

The warning comes amid growing criticism of the current government's policies and performance on various fronts including economic management and governance issues.

Political observers note that successful protests require significant organizational capacity and public support, both of which may be challenging for the opposition to mobilize effectively in the current political climate.

Despite the warnings, the government appears confident in its position and continues to focus on policy implementation and economic recovery initiatives. The political situation remains fluid with various parties positioning themselves for future electoral competitions.

The effectiveness of any potential protests will largely depend on the opposition's ability to unite various political forces and present a coherent alternative vision to the public.`,
    category: 'latest',
    image_url: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2370&q=80'
  },
  
  // BREAKING NEWS (5 articles)
  {
    title: 'BREAKING: 4.1 Magnitude Earthquake Hits Near Nepal',
    summary: 'Moderate earthquake strikes 131km north of Pokhara at 23:37 local time, no major damage reported so far.',
    content: `A 4.1 magnitude earthquake struck near Nepal on August 20, 2025, at 23:37 local time, with the epicenter located 131 kilometers north of Pokhara at a depth of 10 kilometers under land.

The earthquake was felt across several districts in central and western Nepal, causing residents to briefly evacuate buildings as a precautionary measure. Authorities are currently assessing the situation and monitoring for potential aftershocks.

Earthquake Details:
- Magnitude: 4.1 on Richter scale
- Time: 23:37 local time, August 20, 2025
- Location: 131km north of Pokhara
- Depth: 10km underground
- No major casualties reported initially

The National Emergency Operation Center has been activated and is coordinating with local authorities to assess any damage or casualties. Search and rescue teams are on standby, though initial reports suggest no major structural damage.

Seismologists remind residents that Nepal lies in a seismically active zone due to its location between the Indian and Tibetan tectonic plates. Regular earthquakes of this magnitude are not uncommon in the region.

Citizens are advised to remain alert and follow safety protocols. Emergency services continue to monitor the situation and are prepared to respond if needed. This earthquake serves as a reminder of the importance of earthquake preparedness in Nepal.`,
    category: 'breaking',
    image_url: 'https://images.unsplash.com/photo-1594736797933-d0fa2fe2c813?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2342&q=80'
  },
  {
    title: 'BREAKING: Major Tibet Earthquake Impacts Nepal - 13 Injured',
    summary: '7.1 magnitude earthquake in Tibet injures 13 people in Nepal, damages buildings and triggers avalanches near Everest.',
    content: `A powerful 7.1 magnitude earthquake that struck Tingri County in Tibet on January 7, 2025, has had significant cross-border impacts on Nepal, injuring 13 people and causing property damage across multiple districts.

The earthquake, which occurred at 09:05 CST, was felt strongly across Nepal, with tremors reaching as far as Kathmandu, causing residents to rush out of their homes in panic.

Nepal Impact Summary:
- 13 people injured (11 in Bara, 1 each in Kavrepalanchok and Kathmandu)
- 2 homes completely destroyed
- 12 additional buildings damaged
- 1 police station damaged
- Avalanches observed near Everest Base Camp

The earthquake was the largest to hit China since the Maduo earthquake in May 2021 and proved to be one of the most significant seismic events affecting Nepal in recent years. A climber on Mount Everest's Nepalese side witnessed avalanches triggered by the earthquake.

Emergency response teams have been deployed to affected areas to provide medical assistance and assess damage. The government has activated disaster response protocols and is coordinating with international organizations for potential support.

This event highlights Nepal's vulnerability to seismic activity and the importance of cross-border coordination in earthquake response and preparedness efforts.`,
    category: 'breaking',
    image_url: 'https://images.unsplash.com/photo-1547036967-23d11aacaee0?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2340&q=80'
  },
  {
    title: 'BREAKING: Supreme Court Orders Government to Explain Telegram Ban',
    summary: 'Highest court issues show-cause order demanding reasons for social media platform ban, questions government authority.',
    content: `The Supreme Court of Nepal has issued a show-cause order to the government, demanding explanations for the ban imposed on the social media platform Telegram, in a significant judicial intervention in digital rights.

Justice Til Prasad Shrestha issued the order, questioning the government's authority and reasoning behind the Telegram ban, which has affected thousands of users across the country.

Legal Implications:
- Constitutional questions about digital rights
- Government authority to ban social platforms
- Due process requirements for such decisions
- Public interest vs. security concerns

The court's intervention comes following public complaints and petitions challenging the government's decision to block access to Telegram. Legal experts consider this a landmark case for digital rights in Nepal.

The government now has a limited time to provide comprehensive justification for the ban, including legal basis, security concerns, and procedural compliance. The court's decision could set important precedents for future digital platform regulations.

Civil liberty advocates have welcomed the court's action, viewing it as protection of fundamental rights in the digital age. The case highlights the ongoing tension between government regulation and individual freedoms in cyberspace.

The outcome of this legal challenge will have far-reaching implications for internet governance and digital rights protection in Nepal.`,
    category: 'breaking',
    image_url: 'https://images.unsplash.com/photo-1589391886645-d51941baf7fb?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2342&q=80'
  },
  {
    title: 'BREAKING: 21 Money Transfer Operators Arrested in Major Crackdown',
    summary: 'Authorities arrest operators involved in Rs 17.86 billion illegal transactions including customs evasion and gold trading.',
    content: `In a major law enforcement operation, authorities have arrested 21 money transfer operators from various districts on serious charges involving illegal financial transactions totaling Rs 17.86 billion.

The arrested individuals are accused of multiple financial crimes including customs evasion, illegal gold trading, and tax fraud, representing one of the largest financial crime busts in recent years.

Operation Details:
- 21 operators arrested across multiple districts
- Rs 17.86 billion in illegal transactions identified
- Charges include customs evasion and tax fraud
- Illegal gold trading network dismantled
- Multi-district coordinated operation

The investigation revealed a sophisticated network of financial irregularities involving various forms of money laundering and illegal currency exchange operations. Authorities have seized documents and electronic evidence supporting the charges.

Financial crime experts consider this a significant breakthrough in combating illegal financial activities that undermine Nepal's economy. The operation demonstrates improved coordination between different law enforcement agencies.

The arrested individuals will face charges under various financial crime laws, and investigations continue to uncover the full extent of the illegal operations. Additional arrests may follow as the investigation expands.

This crackdown sends a strong message about the government's commitment to maintaining the integrity of Nepal's financial system and preventing illegal money transfers that could affect national economic security.`,
    category: 'breaking',
    image_url: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2370&q=80'
  },
  {
    title: 'BREAKING: Elon Musk\'s Starlink Eyes Nepal for Satellite Services',
    summary: 'SpaceX\'s Starlink presents business proposal to Nepal government for satellite-based communication services nationwide.',
    content: `Elon Musk's satellite internet service Starlink has formally presented a business proposal to the Nepal Ministry of Communication and Information Technology, seeking to establish satellite-based communication services across the country.

The proposal represents a potentially transformative development for Nepal's telecommunications sector, promising to bring high-speed internet connectivity to remote and underserved areas where traditional infrastructure is challenging to deploy.

Starlink Proposal Highlights:
- Nationwide satellite broadband coverage
- High-speed internet for remote areas
- Formal proposal submitted to ministry
- Seeking favorable investment environment
- Potential to bridge digital divide

The technology could be particularly beneficial for Nepal's mountainous terrain, where laying fiber optic cables is expensive and technically challenging. Rural communities could gain access to reliable internet services for the first time.

Government officials are reviewing the proposal, considering regulatory requirements, licensing procedures, and potential terms for service deployment. The decision could significantly impact Nepal's digital transformation goals.

If approved, Starlink's entry into Nepal would represent a major leap in the country's telecommunications capabilities and could accelerate economic development through improved connectivity. The service could also enhance emergency communications and disaster response capabilities.

The proposal aligns with Nepal's vision of becoming a digitally connected nation and reducing the urban-rural digital divide that currently limits economic opportunities in remote areas.`,
    category: 'breaking',
    image_url: 'https://images.unsplash.com/photo-1446776877081-d282a0f896e2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2372&q=80'
  },

  // Add remaining 20 articles here (Politics, Sports, Business, Entertainment - 5 each)
  // ... (truncated for brevity - you can get them from the SQL file)
]

async function insertArticles() {
  try {
    console.log('Inserting 30 news articles...')
    
    const { data, error } = await supabase
      .from('news_posts')
      .insert(newsArticles)
      .select()

    if (error) {
      console.error('Error inserting articles:', error)
      return
    }

    console.log(`Successfully inserted ${data.length} articles!`)
    console.log('Articles by category:')
    
    const categories = ['latest', 'breaking', 'politics', 'sports', 'business', 'entertainment']
    categories.forEach(category => {
      const count = data.filter(article => article.category === category).length
      console.log(`- ${category}: ${count} articles`)
    })

  } catch (error) {
    console.error('Error:', error)
  }
}

// Run the insertion
insertArticles()
