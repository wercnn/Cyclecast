ECS522U GUI COURSEWORK : Assignment 1 2025/26 







Group 19




Group members : 

Yigit Eren Dogan, 
Arin Kaptan, 
Junyi Lu, 
Bryan Thierry Mendes Da Costa,
Ebubechukwu David Noble Ezeonyeasi (Absent)











 

 Table of Contents


ECS522U GUI COURSEWORK : Assignment 1 2025/26	1
Table of Contents	2
Section 1: Overview Of Your Primary Stakeholder Group	3
Section 2: Identification And Description Of Wider Stakeholders	5
Section 3: Data Gathering	6
Section 4: Requirements Development for the Primary Stakeholder	8
Section 5: Design	9
a) Design Rationale:	9
b) Rendering of the first screen:	10
c) Find today’s Temperature:	11
d) Summary of the design:	14
Section 6: Project Roadmap	15
References	19




   





Section 1: Overview Of Your Primary Stakeholder Group
Commuting every day can be challenging, especially for university students. Many are away from home, trying to eat something quickly before leaving the house to catch a bus for a 9:00 AM lecture. However, what about the students who cycle? There is a significant difference between these two groups. On a rainy day, a pedestrian can simply grab an umbrella or enter the sheltered space of a tube carriage, bus, or car. They remain relatively dry, whereas a cyclist must carefully consider their clothing, safety, and timing.
Primary Stakeholder
Our primary stakeholder is the urban university student (ages 18–25) who relies on a bicycle as their main mode of transport to campus. They are typically undergraduate or postgraduate students who live in student housing or shared flats within a 3–7 mile radius of the university. They choose cycling mainly because it removes the cost of daily public transport. It is also often faster than public transport during rush hour, especially when buses are delayed or heavily affected by traffic.
Unlike hobby riders or professional cyclists, this group cycles out of necessity rather than sport. Because they are students, they often have limited budgets and cannot always afford high-quality cycling gear. As a result, they are more vulnerable to sudden weather changes. For them, accessible and reliable weather information is especially important.
This stakeholder group is also highly digitally literate. They use their smartphones daily for academic work, social media, and especially for time management, as they are often under time pressure. Before leaving for a 9 AM lecture, they do not have time to analyse complex weather charts or detailed forecasts. Instead, they need information that is clear, quick and easy to understand. 
Weather as a Decision Factor
For students who cycle to school daily, weather is the most important factor in how they start their day. Weather conditions influence several daily decisions. Such as:
What to wear (waterproof jackets, gloves, extra layers)
Whether to leave earlier due to strong winds
Whether cycling is safe during heavy rain or icy conditions of the road
Whether to consider alternative transport for the day
Rain increases discomfort and reduces visibility. Windy conditions can affect both safety and journey time. Cold temperatures may require additional clothing, and during winter months, ice can create serious safety risks. Most importantly, their bodies are fully exposed while cycling. These factors have a much greater impact on them compared to students travelling by bus or train.
Because of this, this group does not only require temperature and general weather conditions. They would benefit more from an app that relates weather information directly to cycling. For example, wind speed is more valuable to a cyclist than to a pedestrian. Also, precipitation probability during commuting hours (e.g., 8–10 AM and 4–6 PM) is more relevant than a general daily forecast.
Key Characteristics and Needs
From our understanding, this stakeholder group demonstrates the following characteristics:
Time sensitive
Budget conscious
Digitally confident but cares more about efficiency
Directly affected by environmental conditions
Average or moderate cycling experience
These characteristics suggest that their needs include:
Simple visual indicators, such as a cycling suitability score
Immediate visibility of temperature, precipitation probability, and wind speed
Weather forecasts focused more on commuting times
Clear safety alerts for hazardous conditions
A clean, mobile responsive interface (as most students check the weather on their phones rather than on a computer)
In summary, the urban university student (ages 18–25) who cycles to campus is a well-defined and researchable primary stakeholder. Their reliance on bicycles as their main form of transportation makes weather information significantly more important to them compared to other commuting students. Weather directly influences their safety, comfort, and time management. Therefore, a weather application designed specifically around their needs could provide meaningful benefits for their daily transportation.








Section 2: Identification And Description Of Wider Stakeholders

Secondary stakeholders
Secondary stakeholders are groups of users who use the same web app for similar purposes, for example: delivery riders, leisure or professional cyclists, runners and so on. They share the same data on the app with primary stakeholders including the weather today or for the next few hours. And temperature, rain probability and wind speed are also crucial information to them. Their needs are close to the primary group, so supporting them improves overall usability without changing the core focus.
Tertiary stakeholders 
Tertiary stakeholders are groups of users indirectly affected by cyclists’ weather-informed decisions, for example, cycling club organizers planning riding events, clients relying on arrival time, or local businesses whose activity is outdoor. Those groups of users do not usually operate with the weather app, but they can share the information with the cyclists that can tell them about the cancellations, delays or other options.
Facilitating stakeholders
Either the weather provider, the location searching services, the web platform or the related infrastructure will interact with each other. They will ensure availability, reliability, privacy and the update frequency of the data. This will directly affect the UI, which can present dynamic weather changes and cyclist-relevant information. Their constraints also influence what extensions are feasible.








Section 3: Data Gathering
Link to all the questions and answers to our questionnaire as a spreadsheet:
https://docs.google.com/spreadsheets/d/1dDNIHn5fy_zdsSVAn4E0LjJxZsZM3tnwDvSBt1g77mI/edit?usp=sharing 

Data Gathering Techniques 

We used two data gathering techniques, an online questionnaire, and a competitor review. The data from 42 participants of our online questionnaire, from our primary stakeholders, provided quantitative information on their weather checking habits, frustrations, and preferences. It was chosen because it is efficient to gather data from a target group. We also did a review of the most popular weather applications. It was used to understand our questionnaire's answers, and to see common design patterns. Combining these two gave us the credible information needed to produce a design that used found strengths, and eliminated the weaknesses.

Data Gathering Results 

Participant Profile 

The participants were our primary stakeholders, cyclists who commute to university, with the majority of them being moderately to highly confident in their cycling abilities. The most common number of days cycled to university was 3 to 4 days a week. The weather plays a critical role in their decision to cycle, as the majority (40.5%) was moderate to highly influenced by it, with none selecting the not influenced at all option. 

Priorities

The data shows participants mainly care about rain (81%), followed by ice and other road conditions (61.9%), and wind (59.5%)*. The majority feel moderately prepared currently for sudden weather changes. The main reason they open the apps is to help them decide whether to cycle or not (69%), followed by checking wind strength (54.8%), checking to see whether to wear waterproof clothing (59.5%), and checking the temperature (50%)*.

The data also shows that most participants are likely to cycle in light rain and wind. Most are also likely or consider cycling in hot or cold weather. The majority was unlikely to cycle in heavy rain, strong wind, fog, and especially very unlikely to cycle if the roads were icy. This shows that a tool separating manageable and dangerous conditions and alerting based on this can be useful for them. Over a quarter (28.6%) using two apps also shows that current apps do not meet their needs in one place. 





Complaints

The most common issue faced while commuting was getting caught in the rain (66.7%). Followed by wind and slippery road concerns. Over half (52.4%) reporting being misled by weather apps as another issue shows accuracy and clarity lacks in apps. The majority also feel moderately frustrated with the information they receive. This shows accurate real timed alerts are important.
 
Competitor Review 

We reviewed the most popular weather apps: Apple Weather [1], BBC Weather [2], AccuWeather [3], and The Weather Channel [4]. Apple Weather has a clean interface, but no cyclist specific information such as wind direction, road warnings, or safety ratings. Wind strength and precipitation also are down below the otherwise easy to scan interface. BBC Weather uses clear icons, but the real time alerts are limited when it comes to sudden weather changes. Personalization and information on routes are not provided. AccuWeather has minutely rain forecasts, but the interface is cluttered, full of panels, and advertisements. The Weather Channel provides much data including long forecasts, UV index, and air cleanliness, but the interface is cluttered and full of advertisements. 

The features our questionnaire participants want the most are lacking. These are cyclist tailored wind warning (61.9%), cycling safety scores (59.5%), and less limited accurate real time alerts and road condition updates (both 59.5%)*.

Implications

We need

Cycling specific safety ratings
Real time alerts
A clear interface 
Clothing recommendations 
Route Suggestions 
Personalisation (as a majority of participants rated it as being moderately to highly important.)

in our design.

*These questions in the questionnaire had multiple answers selectable, which is why percentages will not add up to 100.









Section 4: Requirements Development for the Primary Stakeholder
4.1 Functional requirements (what the system should do)
The system must support the primary workflow. 69% of the students check the weather first to decide whether to cycle from the survey. The main cycling factors are rain(81%), ice road(61.9%), wind(59.5%), temperature(50%), so the app must display the current conditions and a short term forecast also for different time(morning/evening) as well as the conditions for example ice, strong wind.And the app also need to evaluate the cycling suitability.

4.2 Non-functional requirements — Data (accuracy, update, storage, access)
In the survey, 52.4% of the students are being misguided by the weather app and 66.7% of them have been caught by the rain while cycling, so the quality and freshness of the app is really important. The system should refresh hourly or minutely if possible for wind strength, ice road indicators. Locations can be manually input and if the location is used, the permissions must be minimum and transparent. If the API fails, to avoid misleading screen, blank or system error, the app needs to display the most recent data with a clear warning.

4.3 Non-functional requirements — Usability (speed, clarity, learnability)
Users are identified with the traveller with a limited amount of time they need to understand the information rapidly rather than the meteorological analysis. 28.6% of cyclists are using two apps. The system must provide a clear and understandable interface including decision summary (e.g., “Safe / Caution / Avoid”) plus 3–4 key metrics above the fold (rain %, wind, temperature, ice/road warning). Moreover, the interface should be designed as clear as possible with minimal taps, minimal scrolling.

4.4 Non-functional requirements — Environment (where/when it’s used)
The app will be used during a fast paced morning routine or sometimes outdoors in wet/windy conditions. As a result, the interface must stay readable within different light conditions. Besides, the environments of users are different, some of them will cycle during small rain or wind days, but they are unlikely to cycle when there is heavy rain/strong wind/fog/ice conditions. The system must show the hazard states because it is related to safety. In addition, the design must not assume that the users have stable internet connection while travelling.
4.5 Non-functional requirements — User characteristics (who they are, preferences)
According to the survey, the primary stakeholders are 18-25 aged uni cyclists who travel 3-4 days to uni every week with moderate or high confidence.They are digitally literate but budget constrained and want efficiency.Their preferences are clear: rain is the top concern (81%), followed by icy/slippery roads and strong winds; they also value wind force warnings and safety ratings for cyclists (in our survey results, the support rates for both are approximately 59.5% to 61.9%). As a result, the app should prioritize the conditions for cyclists, not the normal weather conditions.

4.6 Non-functional requirements — Experience (pleasantness, motivation, “easy”)
Confidence and reduced anxiety is our main goal for this design. 66,7% of cyclists experienced the sudden rain during cycling, and 52.4% of them were misguided by the weather app, as a result this design needs to be trustable.Competitor review supports this: some apps are clean but hide relevant metrics; others provide detail but are cluttered. A good experience with using this app should include manual output for example, how many cloth and what types of cloth we should put on that day. And also the safety rating, so the users will feel supported rather than just give them normal weather information. 

Section 5: Design

a) Design Rationale:
Our web application is designed to solve the day-to-day struggles of cyclists by prioritizing efficiency and actionable safety data over general weather app meteorology. Given that 69% of students check the weather to decide whether to cycle or not, the first page after the home screen features a “Cycling Suitability Score” at the top. This visual indicator helps students decide whether they should cycle to university or not.
To address the vulnerability of cyclists (81% of them are concerned about rain), displaying precipitation probability and wind speed was our main goal in this app. Unlike generic weather apps, our forecast shows specific rush-hour periods based on when the user commutes to the university (the user will choose their commute hours). Because our stakeholders are budget-constrained and often do not have professional gear, the app includes specific clothing recommendations to prevent them from getting caught in sudden rain.
For the design rationale, we chose to design a mobile web application because most users will use their phones to check the weather. Therefore, the interface was designed primarily for mobile resolution.




b) Rendering of the first screen:

























c) Find today’s Temperature:

Goal: The user wants to find today’s temperature in order to determine whether it is safe to cycle and what clothing to wear.

Precondition: The user has opened the web-based application.

Step 1: Inputting Location

The user enters their desired city or airport into the search field. After the location has been submitted and the icon has been clicked, the screen would change to display the weather dashboard for that specific city.

Step 2: Viewing Dashboard
The user locates and views the main dashboard.The dashboard presents key cycling-related weather information in the following order:
Location
Cycling Suitability Score
Rain (with precipitation percentage)
Wind Speed
Current Temperature
Road Conditions
The current temperature is visible at a glance without requiring additional interaction.
Alternative Step: View hourly forecast
The user scrolls down to locate the “Hourly Forecast” section and scrolls horizontally to view temperature changes throughout the day.The system displays an interactive hourly forecast, allowing the user to examine temperature variations and better plan their cycling activity.
Outcome
The user reads the temperature and related weather conditions and makes an informed decision about cycling and appropriate clothing.






Step 1: Inputting Location













Step 2: Viewing Dashboard




Alternative Step: View hourly forecast

















d) Summary of the design:

CycleCast is a cycling focused weather app designed for university students who commute by cycling. It is designed to provide a cycling safety score at first glance for quick decision making. The wind speed and impact, rain probability and time, road safety conditions for ice and similar risks, and temperature is provided right below the score for speedy critical knowledge. There are real timed alerts for approaching winds and impactful weather conditions alongside clothing recommendations for the current weather. Right above the hourly forecast are the ideal commute times closest to the current time for easy scheduling of commutes. 




































Section 6: Project Roadmap 

Road Map Sketch 









Phase/Week
Milestone
Key tasks
Evidence of completion
Week 5
Project setup + design lock
Create basic structure, and shared Git repo,finish the first page of figma and storyboard
Repo created,the project can run locally, decided the figma design
Week 6


Weather API integration 
Choose API and termination, data collection by fetch, analysis the core concept(temperature, weather condition,rain, wind speed), added the latest update time
The app can update the realtime data, the location is enabled, error state and latest update time is shown.
Week 7
Core UI implementation 
Build the UI dashboard by  figma, show the today temperature clearly, display the weather condition hourly,make sure the core information is on the first screen
dash board is same with figma, the weather condition include temperature is shown on the first screen, hourly forecast is enabled
Week 8 
Stakeholder-specific features 
Implement cycling suitability score logic (based on rain/wind/ice thresholds), add the cycling alert with the road condition, suggestion of the cloth and equipment, choose of the travel time(day,night) and give the information of it
Correct reason for the cycling alert, suggestion of the cloth and equipment is enabled
Week 9
Testing, polish, and consistency
Cross-device/cross-browser testing; fixing UI and interaction bugs; accessibility checks (font size, contrast, touch area); performance optimization (loading speed, number of requests); handling edge cases (missing data, weak network, location failure).
The bug list is closed or controllable; at least two browsers have been verified; the mobile version has good readability; there is a clear degradation performance in case of weak network/API failure.
week 10
Demo readiness + submission packaging
Record the demonstration video; prepare the demonstration script (problems → core functions → alignment with stakeholders' needs); clean up the code and README; check the rubric coverage points; finalize the report layout and organize the screenshots.
The demonstration video has been completed; the warehouse is clean and reproducible; the README is complete; the report contains the final screenshots/Storyboard links and can be submitted.














Division of Tasks 

 Name
Primary ownership
Concrete tasks / outputs
Yigit Eren Dogan
Implementation lead
Build the main pages and connect the UI to API, set up the whole structure
Bryan Thierry Mendes Da Costa
UI and code development and 
Convert figma into components,provide final screenshots that meet the requirements
Junyi Lu
Cyclist feature logic and requirements
Implement/define cycling suitability score thresholds, evaluate the cyclist features and make changes for the app
Arin Kaptan
Data gathering and evaluation
Design the user test plan , collect and evaluate the results, suggestions of the improvements


Ebubechukwu David Noble Ezeonyeasi (absent): no tasks assigned




Potentially Problematic Areas (and Mitigation)
Cycling safety score definition and implementation


Why it’s problematic: it is not easy to convert the primary weather data into a cycling score,we need to ensure the input(rain, wind speed, temperature）暗and we need a reasonable threshold that is founded. Also we need to give a clear explanation otherwise the users will not believe.
Mitigation: Start with a simple MVP threshold and it will be allowed to adjust, the reason will be displayed beside it, the users can reflect the correction of the threshold and we can update the threshold according to it.


Weather API limitations (rate limits, missing fields, inconsistent data)


Why it’s problematic: Some API do not provide the information that is related to cycling, and there will be a rate limit, so the update is not very stable. Different places will cause the difference in forecast.

Mitigation: Choose an API that supports the rain, wind speed report hourly, and implement caching and backoff. If some of the data is not available(ice) it can estimate it according to other weather data.


Real-time alerts accuracy vs user trust


Why it’s problematic: The questionnaire shows that many users feel that the current weather apps are "misleading". If the alerts are inaccurate, it will directly affect credibility; especially the "start/end times of sudden rain" are  difficult to predict.
Mitigation: Avoid overly prompts and express them using probabilities/ intervals (e.g. "There is a high probability of rainfall from 08:30 to 09:10"); if it is impossible to ensure the reliability of the reminders, at least ensure the visualization of hourly forecasts and clear key indicators, allowing users to make their own judgments.
Skill gaps in React and API integration


Why it’s problematic: Some team members (e.g., Arin and Junyi) have not done much on development of API/React. There may also be members in the team who have little experience, which can lead to problems such as slow development speed, inadequate handling of interface errors.
Mitigation: Designate the technical lead to first build the project scaffolding and the API access layer; keep the architecture simple; develop using a component-based approach; schedule 30-45 minutes for internal sharing/pair programming (React basics, fetch pattern, state management).
Integration complexity (design-to-code mismatch and merge conflicts)


Why it’s problematic: When multiple people work on both the UI and data logic simultaneously, it is easy for component duplication, inconsistent styles, and Git merge conflicts, especially when the deadline is approaching.
Mitigation:freeze figma early; unify the component list (such as WeatherCard, MetricTile, CommuteToggle, AlertBanner); adopt feature branch + PR review; establish naming conventions and folder structure; make small steps of commits, frequently merge, and avoid long-term branches.
References 

[1] “Check the weather on iPhone,” Apple Support, https://support.apple.com/en-gb/guide/iphone/iph1ac0b35f/ios (accessed Feb. 18, 2026). 
[2] “Home,” BBC Weather, https://www.bbc.co.uk/weather (accessed Feb. 18, 2026). 
[3] “Local current weather: AccuWeather,” Local, National, & Global Daily Weather Forecast, https://www.accuweather.com/en/gb/lnd/london-weather (accessed Feb. 18, 2026). 
[4] “Weather forecast and conditions for Charing Cross, Westminster, England - the weather channel,” The Weather Channel, https://weather.com/en-GB/weather/today/l/UKXX0085:1:UK?Goto=Redirected (accessed Feb. 18, 2026). 
[5]   “Survey on [Student Cyclist],” unpublished survey, conducted via Google Forms, responses collected [Feb. 2026]. Available: https://docs.google.com/spreadsheets/d/1dDNIHn5fy_zdsSVAn4E0LjJxZsZM3tnwDvSBt1g77mI/edit?usp=sharing.

