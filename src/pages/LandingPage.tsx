import { ArrowRight, Github, Linkedin, Twitter } from 'lucide-react';
import { Link } from 'react-router-dom';

// MODIFIEZ VOS INFORMATIONS ICI
const userInfo = {
  name: "Germain Hounsouke",
  title: "Développeur & Trader",
  bio: "Passionné par la création d'outils qui fusionnent la finance et la technologie. J'explore constamment de nouvelles façons de visualiser les données et d'optimiser les stratégies.",
  socials: {
    linkedin: "https://www.linkedin.com/", // Votre lien LinkedIn
    github: "https://github.com/Germino-py",
    twitter: "https://twitter.com/", // Votre lien Twitter
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
];

export const LandingPage = () => {
  return (
    <div className="landing-page-bg">
      {/* On ajoute une div pour séparer le contenu du fond */}
      <div className="landing-page-content">
        <div className="max-w-4xl mx-auto p-4 sm:p-8">
          
          <nav className="flex justify-between items-center py-4">
            <div className="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">
              GH
            </div>
            <div className="flex gap-6 text-sm font-medium text-neutral-300">
              <a href="#projets" className="hover:text-white transition-colors">Projets</a>
              <a href="#contact" className="hover:text-white transition-colors">Contact</a>
            </div>
          </nav>

          <header className="py-24 text-center">
            <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent pb-2">
              {userInfo.name}
            </h1>
            <h2 className="text-xl md:text-2xl text-neutral-400 mt-2">{userInfo.title}</h2>
            <div className="flex justify-center gap-4 mt-8">
              <a href={userInfo.socials.github} target="_blank" rel="noopener noreferrer" className="text-neutral-400 hover:text-white transition-colors"><Github size={22} /></a>
              <a href={userInfo.socials.linkedin} target="_blank" rel="noopener noreferrer" className="text-neutral-400 hover:text-white transition-colors"><Linkedin size={22} /></a>
              <a href={userInfo.socials.twitter} target="_blank" rel="noopener noreferrer" className="text-neutral-400 hover:text-white transition-colors"><Twitter size={22} /></a>
            </div>
          </header>

          <main id="projets" className="py-16">
            <h3 className="text-3xl font-bold text-white mb-10 text-center">Mes Projets</h3>
            <div className="grid md:grid-cols-2 gap-8">
              {projects.map((project) => (
                <Link to={project.link} key={project.title} className="bg-[#161616] border border-neutral-800 rounded-xl p-6 flex flex-col group hover:border-purple-500/50 transition-all duration-300 transform hover:-translate-y-1">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-xl font-bold text-white">{project.title}</h4>
                      {project.live && (
                        <div className="flex items-center gap-1.5 text-xs text-green-400">
                          <span className="relative flex h-2 w-2"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span><span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span></span>
                          Live
                        </div>
                      )}
                    </div>
                    <p className="text-neutral-400 text-sm">{project.description}</p>
                  </div>
                  <div className="flex items-center text-sm text-neutral-400 group-hover:text-purple-400 transition-colors duration-300 mt-6">
                    <span>Accéder au projet</span>
                    <ArrowRight size={16} className="ml-1 group-hover:translate-x-1 transition-transform duration-300" />
                  </div>
                </Link>
              ))}
            </div>
          </main>

          <footer id="contact" className="text-center py-16 text-neutral-500">
              <h3 className="text-3xl font-bold text-white mb-4">Contact</h3>
              <p className="text-neutral-300">N'hésitez pas à me contacter.</p>
              <a href="mailto:votre.email@example.com" className="text-lg text-purple-400 hover:underline mt-2 inline-block">germain.hounsouke@gmail.com</a>
          </footer>

        </div>
      </div>
    </div>
  );
};