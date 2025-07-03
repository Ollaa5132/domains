import { useState,  useEffect } from 'react';
import './App.css'

function App() {
  const [domains, setDomains] = useState([]);
  const [newDomain, setNewDomain] =useState('');
 
  useEffect(() => {
  fetch("https://twilio-api.mock.beeceptor.com/2010-04-01/Accounts/ACFC3fe6ebc1a7d9732ae4EAACCB9Eb3e8/SIP/Domains.json")
    .then(res => res.json())
    .then(data => {
      if (Array.isArray(data.domains)) {
          setDomains(data.domains);
          console.log("Odebrane domeny:", data.domains);
        }else {
          console.error("Oczekiwano tablicy");
        }
    })
    .catch(err => console.error("Błąd fetch:", err));
  }, []);
  
  const createDomain = () => {
    console.log("Tworzę domenę:", newDomain);
    if (!newDomain.trim()) return; 
    const sid = generateSid("AC"); 

    const newDomainToAdd = {
      sid: sid,
      domain_name: newDomain,
      friendly_name: newDomain,
    };

    // optymistyczne dodanie domeny
    setDomains(prev => [...prev, newDomainToAdd]);

    setNewDomain(''); 

    function generateSid(prefix) {
      const chars = '0123456789abcdef';
      let randomPart = '';
      for (let i = 0; i < 32; i++) {
        randomPart += chars[Math.floor(Math.random() * chars.length)];
      }
      return prefix + randomPart;
    }

    fetch("https://twilio-api.mock.beeceptor.com/2010-04-01/Accounts/ACFC3fe6ebc1a7d9732ae4EAACCB9Eb3e8/SIP/Domains.json", {
    method: "POST",
    headers: {
    "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      DomainName: newDomain,
      FriendlyName: newDomain,
      VoiceMethod: "GET",
      VoiceFallbackMethod: "GET",
      EmergencyCallerSid: generateSid("PN"),
      VoiceStatusCallbackMethod: "POST",
      VoiceFallbackUrl: "https://fallback.example.com",
      VoiceUrl: "https://voice.example.com",
      Secure: "true",
      ByocTrunkSid: generateSid("BY"),
      EmergencyCallingEnabled: "false",
      VoiceStatusCallbackUrl: "https://callback.example.com",
      SipRegistration: "true"
    }).toString()

  })
  //.then(res => res.json())
  .then(async res => {
  const text = await res.text();
  console.log("Odpowiedź serwera (tekst):", text);
  try {
    const data = JSON.parse(text);
    console.log("Parsowany JSON:", data);
  } catch (err) {
    console.error("Niepoprawny JSON:", err);
  }
})

  .then(data => {
    console.log("Odpowiedź POST:", data);
  })
  .catch(err => console.error("Błąd POST:", err));
  }

  return (
    <>
      <h1>Domeny:</h1>
      <input type="text" value={newDomain} onChange={e => setNewDomain(e.target.value)}></input>
      <button onClick={createDomain}>Dodaj domenę</button>
      <ul>
        {domains.map(domain => (
          <li key={domain.sid}>
            {domain.friendly_name ?? domain.domain_name ?? domain.sid ?? domain.account_sid}
          </li>
        ))}
      </ul>
    </>
  )
}

export default App
