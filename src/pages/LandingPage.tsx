import { ArrowRight, Github, Linkedin, Twitter } from 'lucide-react';

// Vous pouvez modifier ces informations directement
const userInfo = {
  name: "Germain Hounsouke",
  title: "Développeur & Trader",
  bio: "Passionné par la création d'outils qui fusionnent la finance et la technologie. J'explore constamment de nouvelles façons de visualiser les données et d'optimiser les stratégies.",
  socials: {
    linkedin: "#", // Mettez votre lien LinkedIn ici
    github: "https://github.com/Germino-py",
    twitter: "#", // Mettez votre lien Twitter ici
  }
};

const projects = [
  {
    title: "TradeCopilot",
    description: "Un journal de trading complet pour analyser et améliorer vos performances. Suivez vos trades, consultez vos statistiques et planifiez vos sessions.",
    link: "/tradecopilot", // Lien interne vers votre application
    live: true
  },
  {
    title: "Projet à Venir",
    description: "Description de votre prochain projet incroyable. Restez à l'écoute pour plus de détails.",
    link: "#",
    live: false
  },
  {
    title: "Autre Projet",
    description: "Description d'un autre projet que vous souhaitez mettre en avant.",
    link: "#",
    live: false
  }
];

export const LandingPage = () => {
  return (
    <div className="min-h-screen bg-[#111111] text-neutral-200 font-sans p-4 sm:p-8">
      <div className="max-w-4xl mx-auto">
        
        {/* Section Héros */}
        <header className="py-20 text-center">
          <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-b from-white to-neutral-400 bg-clip-text text-transparent pb-2">
            {userInfo.name}
          </h1>
          <h2 className="text-xl md:text-2xl text-neutral-400 mt-2">{userInfo.title}</h2>
          <p className="max-w-2xl mx-auto mt-6 text-neutral-300">
            {userInfo.bio}
          </p>
          <div className="flex justify-center gap-4 mt-8">
            <a href={userInfo.socials.github} target="_blank" rel="noopener noreferrer" className="text-neutral-400 hover:text-white transition-colors"><Github size={24} /></a>
            <a href={userInfo.socials.linkedin} target="_blank" rel="noopener noreferrer" className="text-neutral-400 hover:text-white transition-colors"><Linkedin size={24} /></a>
            <a href={userInfo.socials.twitter} target="_blank" rel="noopener noreferrer" className="text-neutral-400 hover:text-white transition-colors"><Twitter size={24} /></a>
          </div>
        </header>

        {/* Section Projets */}
        <main>
          <h3 className="text-2xl font-bold text-white mb-8">Mes Projets</h3>
          <div className="grid md:grid-cols-2 gap-6">
            {projects.map((project) => (
              <a href={project.link} key={project.title} className="bg-[#1C1C1C] border border-neutral-800 rounded-xl p-6 flex flex-col group hover:border-neutral-700 transition-all duration-300">
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-xl font-bold text-white">{project.title}</h4>
                    {project.live && (
                      <div className="flex items-center gap-1.5 text-xs text-green-400">
                        <span className="relative flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                        </span>
                        Live
                      </div>
                    )}
                  </div>
                  <p className="text-neutral-400">{project.description}</p>
                </div>
                <div className="flex items-center text-sm text-neutral-500 group-hover:text-white transition-colors duration-300 mt-6">
                  <span>Accéder au projet</span>
                  <ArrowRight size={16} className="ml-1 group-hover:translate-x-1 transition-transform duration-300" />
                </div>
              </a>
            ))}
          </div>
        </main>

        <footer className="text-center py-12 text-neutral-500 text-sm">
          <p>&copy; {new Date().getFullYear()} {userInfo.name}. Tous droits réservés.</p>
        </footer>

      </div>
    </div>
  );
};