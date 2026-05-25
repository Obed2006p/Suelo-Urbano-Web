import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { FlowerIcon, WaterDropIcon, SunIcon, AtomIcon, CheckCircleIcon, SparklesIcon, ChevronRightIcon } from './icons/Icons';
import Footer from './Footer';

// Use the newly generated images with fallback stock images
const PHAL_IMG = "/src/assets/images/phalaenopsis_orchid_1779747469981.png";
const CYM_IMG = "/src/assets/images/cymbidium_orchid_1779747485029.png";
const DEN_IMG = "https://images.unsplash.com/photo-1525310072745-f49212b5ac6d?auto=format&fit=crop&q=80&w=800";
const VAN_IMG = "https://images.unsplash.com/photo-1567306226416-28f0efdc88ce?auto=format&fit=crop&q=80&w=800";
const ONC_IMG = "https://images.unsplash.com/photo-1512428559087-560fa5ceab42?auto=format&fit=crop&q=80&w=800";

interface OrchidType {
  id: string;
  name: string;
  scientificName: string;
  image: string;
  characteristics: string;
  season: string;
  light: string;
  watering: string;
  temp: string;
  helpDescription: string;
  dosingTip: string;
}

const ORCHIDS_DATA: OrchidType[] = [
  {
    id: 'phalaenopsis',
    name: 'Phalaenopsis (Orquídea Mariposa)',
    scientificName: 'Phalaenopsis spp.',
    image: PHAL_IMG,
    characteristics: 'Hojas carnosas y anchas de color verde oscuro, raíces aéreas plateadas que realizan fotosíntesis, y flores hermosas y simétricas en forma de mariposa que duran meses.',
    season: 'Invierno y Primavera',
    light: 'Indirecta brillante (cerca de una ventana con cortina traslúcida). Evitar sol directo.',
    watering: 'Regar cuando las raíces internas se vuelvan grises o plateadas. Utilizar agua tibia.',
    temp: 'Templada de 18°C a 24°C; tolera leves descensos por la noche para incentivar floración.',
    helpDescription: 'La emulsión orgánica Suelo Urbano aporta micronutrientes quelatados de forma natural como el hierro y magnesio. Al ser libre de sales agresivas, fortalece la cutícula foliar estimulando una floración prolongada y hojas tersas sin quemar los delicados estomas.',
    dosingTip: 'Disolver 2 ml de emulsión en 1 litro de agua reposada. Verter suavemente en el sustrato de corteza de pino cada 15 días durante su periodo de crecimiento dinámico.'
  },
  {
    id: 'cymbidium',
    name: 'Cymbidium',
    scientificName: 'Cymbidium spp.',
    image: CYM_IMG,
    characteristics: 'Hojas largas y delgadas que asemejan listones, pseudobulbos prominentes que almacenan agua y nutrientes, e inflorescencias altas y erguidas sumamente resistentes.',
    season: 'Otoño a Primavera',
    light: 'Muy luminosa, tolera sol directo de la mañana y sombra ligera por la tarde.',
    watering: 'Mantener el sustrato ligeramente húmedo sin encharcar. Reducir riego tras la floración.',
    temp: 'Prefiere climas frescos, requiere que la temperatura baje en otoño para iniciar brotes florales.',
    helpDescription: 'El fósforo orgánico y las auxinas naturales de nuestra emulsión actúan directamente sobre el desarrollo radicular y consolidación de pseudobulbos, lo cual garantiza que sus varas florales crezcan erguidas, gruesas y cargadas de capullos sanos.',
    dosingTip: 'Mezclar 3 ml de emulsión en 1 litro de agua y aplicar en el sustrato semanalmente desde finales del verano hasta que se abran las flores.'
  },
  {
    id: 'dendrobium',
    name: 'Dendrobium (Orquídea Caña)',
    scientificName: 'Dendrobium nobile',
    image: DEN_IMG,
    characteristics: 'Crece verticalmente formando cañas rígidas de donde brotan las hojas alternas y espectaculares cúmulos de flores perfumadas a lo largo de los nodos superiores.',
    season: 'Primavera y Verano',
    light: 'Mucha luminosidad. Necesita sol indirecto de alta intensidad para madurar sus cañas.',
    watering: 'Abundante riego en el periodo de crecimiento activo. Dejar secar casi por completo en letargo.',
    temp: 'Cálido en verano y marcadamente fresco en invierno para promover la floración óptima.',
    helpDescription: 'El nitrógeno y los aminoácidos asimilables de Suelo Urbano nutren de forma ultra-suave la formación de nuevas cañas ("keikis" y brotes basales), aumentando la biomasa foliar y previniendo la clorosis o amarillamiento prematuro de las hojas.',
    dosingTip: 'Diluir 2 ml de emulsión en 1 litro de agua. Regar cada 10 días en la fase activa de crecimiento y suspender en su descanso invernal.'
  },
  {
    id: 'vanda',
    name: 'Vanda (Reina de las Cestas)',
    scientificName: 'Vanda spp.',
    image: VAN_IMG,
    characteristics: 'Espectaculares raíces gruesas enteramente desnudas que cuelgan al aire. Sus flores son de coloridos intensos, incluyendo morados y azules únicos en la naturaleza.',
    season: 'Múltiples floraciones al año',
    light: 'Luz muy intensa y brillante, tolera sol filtrado. Esencial para su vigor continuo.',
    watering: 'Requiere pulverizaciones diarias extensas sobre sus raíces aéreas desnudas (o inmersiones de 20 min).',
    temp: 'Muy cálida (por encima de 20°C constantes); alta humedad ambiental requerida (70-80%).',
    helpDescription: 'Las Vandas carecen de sustrato protector, por lo que absorben todo a través de sus raíces aéreas. La emulsión Suelo Urbano, al ser un bioestimulante natural suave, nutre por aspersión el tejido esponjoso (velamen) sin dejar sales minerales que causen necrosis radicular.',
    dosingTip: 'Fórmula foliar: añade solo 1 ml de emulsión en 1 litro de agua fresca purificada. Aspira o pulveriza generosamente sobre las raíces y el follaje una vez por semana.'
  },
  {
    id: 'oncidium',
    name: 'Oncidium (Dama Danzante)',
    scientificName: 'Oncidium varicosum / spp.',
    image: ONC_IMG,
    characteristics: 'Nubes de flores diminutas en tonos amarillos y cobres que se mecen con el viento, semejando bailarinas. Posee hermosos pseudobulbos ovoides de color verde claro.',
    season: 'Otoño y Primavera',
    light: 'Moderada a intensa brillante. Hojas verde brillante indican niveles perfectos de luz.',
    watering: 'Dejar secar el sustrato entre riegos. Es sensible a la acumulación de humedad en las raíces inferiores.',
    temp: 'Rango amplio y flexible, de 15°C nocturnos hasta 28°C diurnos. Climas bien ventilados.',
    helpDescription: 'Los carbohidratos, ácidos fúlvicos y fitoalexinas naturales presentes en la emulsión activan una simbiosis fúngica beneficiosa en el sustrato (micorrizas), protegiendo activamente las raíces de patógenos y evitando la pudrición.',
    dosingTip: 'Aplica 2 ml disueltos en 1 litro de agua para regar el sustrato de orquídeas cada 15 días, reduciendo la frecuencia a la mitad durante el descanso invernal.'
  }
];

interface OrquideasPageProps {
  header: React.ReactNode;
}

const OrquideasPage: React.FC<OrquideasPageProps> = ({ header }) => {
  const [selectedOrchid, setSelectedOrchid] = useState<OrchidType>(ORCHIDS_DATA[0]);
  const [activeTab, setActiveTab] = useState<'info' | 'cuidados' | 'beneficios'>('info');

  // Calculator State
  const [calcOrchidId, setCalcOrchidId] = useState<string>('phalaenopsis');
  const [numPlants, setNumPlants] = useState<number>(3);
  const [dilutionType, setDilutionType] = useState<'spray' | 'root'>('root');

  const selectedCalcOrchid = ORCHIDS_DATA.find(o => o.id === calcOrchidId) || ORCHIDS_DATA[0];

  const calculateDose = () => {
    let baseDoseMl = 2; // base ml por litro
    if (calcOrchidId === 'vanda' || dilutionType === 'spray') baseDoseMl = 1;
    if (calcOrchidId === 'cymbidium') baseDoseMl = 3;

    const totalLitresNeeded = Math.ceil(numPlants * 0.25); // ~250ml por planta
    const finalLitres = totalLitresNeeded < 1 ? 1 : totalLitresNeeded;
    const finalMlEmulsion = baseDoseMl * finalLitres;

    return {
      litres: finalLitres,
      ml: finalMlEmulsion,
      frequency: calcOrchidId === 'vanda' ? 'Semanal (pulverizar raíces)' : (calcOrchidId === 'cymbidium' ? 'Semanal' : 'Quincenal (cada 15 días)')
    };
  };

  const doseResults = calculateDose();

  return (
    <div className="min-h-screen flex flex-col bg-stone-900/40 text-stone-100 selection:bg-green-600 selection:text-white">
      {header}
      
      <main className="flex-grow pt-8 pb-20 relative overflow-hidden">
        {/* Abstract design elements matching the garden theme */}
        <div className="absolute top-0 left-0 w-96 h-96 bg-green-900/10 rounded-full blur-3xl pointer-events-none -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-20 right-0 w-[500px] h-[500px] bg-emerald-950/10 rounded-full blur-3xl pointer-events-none translate-x-1/3" />

        <div className="container mx-auto px-4 md:px-6 relative z-10 max-w-6xl">
          {/* Main Title & Hero Intro */}
          <div className="text-center max-w-3xl mx-auto mb-16">
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-2 bg-green-900/30 border border-green-800/80 rounded-full px-4 py-1.5 text-xs md:text-sm font-bold text-green-300 mb-6 shadow-xl"
            >
              <FlowerIcon className="h-4 w-4 text-green-400 animate-pulse" />
              <span>Cuidado y Nutrición de Orquídeas Orgánicas</span>
            </motion.div>
            
            <motion.h1 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-white mb-6"
            >
              Cuidado de <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-green-300 to-emerald-300">Orquídeas</span>
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-lg md:text-xl text-stone-300 leading-relaxed font-medium"
            >
              Descubre los secretos sutiles de las flores más elegantes de la naturaleza y cómo nutrirlas intensamente con la emulsión orgánica pura <span className="text-green-300 font-bold">Suelo Urbano Tu Hogar</span>.
            </motion.p>
          </div>

          {/* Interactive Orchid Selector & Detail Section */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 mb-20">
            
            {/* Left Sidebar: Selection Hub */}
            <div className="lg:col-span-4 flex flex-col gap-4">
              <h3 className="text-stone-400 font-bold uppercase tracking-wider text-xs ml-1 mb-1">Selecciona una Variedad</h3>
              
              <div className="flex overflow-x-auto lg:flex-col gap-3 pb-4 lg:pb-0 scrollbar-thin scrollbar-thumb-stone-800">
                {ORCHIDS_DATA.map((orchid, index) => {
                  const isSelected = selectedOrchid.id === orchid.id;
                  return (
                    <button
                      key={orchid.id}
                      onClick={() => {
                        setSelectedOrchid(orchid);
                        setActiveTab('info');
                      }}
                      className={`flex-shrink-0 lg:w-full flex items-center gap-4 text-left p-4 rounded-2xl border transition-all duration-300 ${
                        isSelected 
                          ? 'bg-gradient-to-r from-green-950/80 to-emerald-950/70 border-green-500/50 shadow-lg shadow-green-950/50 scale-[1.02] translate-x-1' 
                          : 'bg-stone-900/45 border-stone-800 hover:border-stone-700/80 hover:bg-stone-900/60'
                      }`}
                    >
                      <div className="h-12 w-12 rounded-xl overflow-hidden shadow-inner border border-stone-800 flex-shrink-0">
                        <img 
                          src={orchid.image} 
                          alt={orchid.name} 
                          className="h-full w-full object-cover transition-transform duration-500 hover:scale-110"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                      <div>
                        <span className={`block font-bold text-sm md:text-base leading-tight ${isSelected ? 'text-green-300 font-extrabold' : 'text-stone-200'}`}>
                          {orchid.name.replace(/ \(Orquídea .*\)/, '')}
                        </span>
                        <span className="block text-xs text-stone-400 italic">
                          {orchid.scientificName}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Right Side: Rich Detail Presenter Panel */}
            <div className="lg:col-span-8">
              <div className="bg-gradient-to-b from-stone-900/90 to-stone-900/70 border border-stone-800 rounded-3xl overflow-hidden shadow-2xl relative">
                
                {/* Decorative glowing gradient top bar */}
                <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-emerald-500 via-green-400 to-emerald-400" />
                
                {/* Image & Quick Info Block */}
                <div className="relative h-64 md:h-80 w-full overflow-hidden">
                  <img 
                    src={selectedOrchid.image} 
                    alt={selectedOrchid.name}
                    className="w-full h-full object-cover brightness-95"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/40 to-transparent" />
                  
                  {/* Floating badge for Blooming Season */}
                  <div className="absolute top-4 right-4 bg-stone-900/90 border border-stone-700/60 backdrop-blur-md px-4 py-2 rounded-full text-xs font-bold text-yellow-300 flex items-center gap-1.5 shadow-xl">
                    <span className="animate-pulse h-2 w-2 rounded-full bg-yellow-400" />
                    Floración: <span className="font-extrabold">{selectedOrchid.season}</span>
                  </div>

                  {/* Header overlay on image */}
                  <div className="absolute bottom-6 left-6 right-6">
                    <h2 className="text-2xl md:text-3.5xl font-extrabold text-white mb-1 leading-tight tracking-tight">
                      {selectedOrchid.name}
                    </h2>
                    <p className="text-sm md:text-base text-stone-300 italic tracking-wide">
                      {selectedOrchid.scientificName}
                    </p>
                  </div>
                </div>

                {/* Sub-Tabs Selector inside Detail Card */}
                <div className="flex border-b border-stone-800 bg-stone-950/40 p-1">
                  {[
                    { id: 'info', label: 'Características' },
                    { id: 'cuidados', label: 'Cuidados Esenciales' },
                    { id: 'beneficios', label: 'Tratamiento Suelo Urbano' }
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as any)}
                      className={`flex-1 text-center py-3.5 text-xs md:text-sm font-bold transition-all relative rounded-xl ${
                        activeTab === tab.id 
                          ? 'text-white bg-stone-900/80 border-b border-stone-800/20' 
                          : 'text-stone-400 hover:text-stone-200 hover:bg-stone-900/20'
                      }`}
                    >
                      {activeTab === tab.id && (
                        <motion.span 
                          layoutId="activeSubTab"
                          className="absolute bottom-1 left-1/2 -translate-x-1/2 w-4 h-1 bg-green-400 rounded-full" 
                        />
                      )}
                      {tab.label}
                    </button>
                  ))}
                </div>

                {/* Dynamic Content Presenter */}
                <div className="p-6 md:p-8 min-h-[220px]">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={activeTab + "_" + selectedOrchid.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.25 }}
                      className="text-stone-300 leading-relaxed text-sm md:text-base"
                    >
                      {activeTab === 'info' && (
                        <div className="space-y-4">
                          <p className="font-medium text-stone-200 leading-relaxed md:text-lg">
                            {selectedOrchid.characteristics}
                          </p>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6 pt-6 border-t border-stone-800">
                            <div className="flex items-start gap-3 bg-stone-950/20 p-3 rounded-xl">
                              <AtomIcon className="h-6 w-6 text-emerald-400 flex-shrink-0 mt-0.5" />
                              <div>
                                <span className="block text-xs font-bold text-stone-400 uppercase tracking-widest">Familia de Orquídea</span>
                                <span className="text-stone-100 font-semibold">Orchidaceae</span>
                              </div>
                            </div>
                            <div className="flex items-start gap-3 bg-stone-950/20 p-3 rounded-xl">
                              <CheckCircleIcon className="h-6 w-6 text-amber-400 flex-shrink-0 mt-0.5" />
                              <div>
                                <span className="block text-xs font-bold text-stone-400 uppercase tracking-widest">Sensibilidad Radicular</span>
                                <span className="text-stone-100 font-semibold">Muy Alta (Sustratos porosos)</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {activeTab === 'cuidados' && (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                          <div className="p-4 rounded-2xl bg-stone-950/30 border border-stone-800/60 hover:bg-stone-950/50 transition-colors">
                            <div className="flex items-center gap-2 text-amber-400 font-extrabold text-sm mb-3">
                              <SunIcon className="h-5 w-5" />
                              <span>ILUMINACIÓN</span>
                            </div>
                            <p className="text-xs md:text-sm text-stone-300 leading-relaxed">
                              {selectedOrchid.light}
                            </p>
                          </div>

                          <div className="p-4 rounded-2xl bg-stone-950/30 border border-stone-800/60 hover:bg-stone-950/50 transition-colors">
                            <div className="flex items-center gap-2 text-blue-400 font-extrabold text-sm mb-3">
                              <WaterDropIcon className="h-5 w-5" />
                              <span>RIEGO</span>
                            </div>
                            <p className="text-xs md:text-sm text-stone-300 leading-relaxed">
                              {selectedOrchid.watering}
                            </p>
                          </div>

                          <div className="p-4 rounded-2xl bg-stone-950/30 border border-stone-800/60 hover:bg-stone-950/50 transition-colors">
                            <div className="flex items-center gap-2 text-emerald-400 font-extrabold text-sm mb-3">
                              <AtomIcon className="h-5 w-5" />
                              <span>TEMPERATURA</span>
                            </div>
                            <p className="text-xs md:text-sm text-stone-300 leading-relaxed">
                              {selectedOrchid.temp}
                            </p>
                          </div>
                        </div>
                      )}

                      {activeTab === 'beneficios' && (
                        <div className="space-y-6">
                          <div className="p-5 rounded-2xl bg-emerald-950/25 border border-emerald-800/30">
                            <span className="inline-block text-[10px] font-extrabold text-emerald-400 uppercase tracking-wider mb-2 bg-emerald-950/80 px-2.5 py-1 rounded-md border border-emerald-800/55">
                              ¿Por qué funciona Suelo Urbano?
                            </span>
                            <p className="text-stone-200 font-medium leading-relaxed">
                              {selectedOrchid.helpDescription}
                            </p>
                          </div>
                          
                          <div className="p-5 rounded-2xl bg-stone-950/45 border border-stone-800 flex flex-col md:flex-row gap-4 items-start md:items-center">
                            <div className="p-2.5 bg-green-900/30 rounded-xl border border-green-800/50 flex-shrink-0 text-green-300">
                              <SparklesIcon className="h-6 w-6" />
                            </div>
                            <div>
                              <strong className="block text-white text-sm md:text-base mb-1 font-bold">Dosis sugerida de aplicación:</strong>
                              <p className="text-xs md:text-sm text-stone-300 leading-relaxed">
                                {selectedOrchid.dosingTip}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                    </motion.div>
                  </AnimatePresence>
                </div>
              </div>
            </div>
          </div>

          {/* El Secreto de la Emulsión: Subtle & Important Educational Section */}
          <div className="bg-gradient-to-tr from-stone-900 to-emerald-950/60 border border-stone-800 rounded-3xl p-8 md:p-12 mb-20 relative overflow-hidden shadow-2xl">
            <div className="absolute top-0 right-0 w-80 h-80 bg-green-500/10 rounded-full blur-3xl pointer-events-none" />
            
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
              <div className="lg:col-span-7">
                <span className="text-xs uppercase tracking-widest text-green-400 font-extrabold block mb-3">CONEXIÓN BIOLÓGICA</span>
                <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-6 leading-tight tracking-tight">
                  La nutrición perfecta para orquídeas <br className="hidden md:block" />
                  <span className="text-green-300">libre de sales agresivas</span>
                </h2>
                
                <p className="text-stone-300 text-base md:text-lg mb-8 leading-relaxed">
                  Las orquídeas son plantas epífitas en su mayoría. En su hábitat natural recolectan nitrógeno orgánico que gotea sutilmente a través del follaje húmedo del dosel arbóreo. No están acostumbradas a concentraciones masivas de elementos sintéticos.
                </p>

                <div className="space-y-4">
                  {[
                    { title: "Baja conductividad osmótica", desc: "Su formulación líquida orgánica nutre sin obstruir ni quemar los finos capilares radiculares de la orquídea en corteza de pino." },
                    { title: "Alta bio-disponibilidad", desc: "Contiene ácidos húmicos y materias pre-digeridas que facilitan la absorción inmediata a niveles intracelulares." },
                    { title: "Protección integral del velamen", desc: "Incentiva el microbioma simbiótico del sustrato, que nutre la raíz y repele hongos patógenos de forma orgánica." }
                  ].map((feat, i) => (
                    <div key={i} className="flex gap-4 items-start">
                      <div className="h-6 w-6 mt-1 flex-shrink-0 rounded-full bg-green-900/40 border border-green-800 flex items-center justify-center text-green-400">
                        <CheckCircleIcon className="h-4 w-4" />
                      </div>
                      <div>
                        <h4 className="font-extrabold text-white text-base leading-tight mb-1">{feat.title}</h4>
                        <p className="text-stone-400 text-sm leading-relaxed">{feat.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Graphic container with elegant instructions */}
              <div className="lg:col-span-5 bg-stone-950/60 border border-stone-800 rounded-3xl p-6 md:p-8 relative">
                <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                  <AtomIcon className="h-5 w-5 text-green-400" />
                  <span>¿Cómo fertilizar tus orquídeas?</span>
                </h3>
                
                <div className="space-y-6">
                  {[
                    { step: "01", title: "Diluye con agua suave", text: "Usa de preferencia agua de lluvia o reposada 24 horas. Disuelve 1 a 2 ml de emulsión por litro." },
                    { step: "02", title: "Modo de Riego: Raíces", text: "Riega con la mezcla directamente en el sustrato (corteza) humedeciendo uniformemente hasta que drene todo el excedente." },
                    { step: "03", title: "Modo Foliar: Hojas y Velamen", text: "Para plantas sin sustrato o aéreas (Vandas), rocía en spray ambas partes de las hojas evitando el centro denso de la roseta." }
                  ].map((step, idx) => (
                    <div key={idx} className="flex gap-4 relative">
                      {idx < 2 && (
                        <div className="absolute left-4 top-10 bottom-0 w-0.5 bg-stone-800" />
                      )}
                      <div className="h-9 w-9 bg-green-950 border border-green-800 rounded-full flex items-center justify-center text-xs font-bold text-emerald-400 flex-shrink-0">
                        {step.step}
                      </div>
                      <div>
                        <h5 className="font-bold text-stone-200 text-sm md:text-base leading-tight mb-1">{step.title}</h5>
                        <p className="text-stone-400 text-xs md:text-sm leading-relaxed">{step.text}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Interactive Dose & Schedule Calculator */}
          <div className="bg-stone-950/35 border border-stone-800/80 rounded-3xl p-6 md:p-10 relative shadow-xl overflow-hidden">
            <div className="absolute -bottom-10 -left-10 w-60 h-60 bg-yellow-500/5 rounded-full blur-2xl pointer-events-none" />
            
            <div className="max-w-3xl mx-auto">
              <div className="text-center mb-8">
                <h3 className="text-2xl md:text-3.5xl font-extrabold text-white mb-2 tracking-tight">
                  Calculadora de Dosis Personalizada
                </h3>
                <p className="text-stone-400 text-sm md:text-base">
                  Calcula la cantidad exacta de agua y emulsión que tus orquídeas necesitan según la cantidad de plantas que tengas.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 pt-4">
                
                {/* Field 1: Orchid Selection */}
                <div className="flex flex-col gap-2">
                  <label className="text-xs uppercase tracking-wider text-stone-400 font-extrabold">Variedad de Orquídea</label>
                  <select
                    value={calcOrchidId}
                    onChange={(e) => setCalcOrchidId(e.target.value)}
                    className="bg-stone-900 border border-stone-800 hover:border-stone-700/80 rounded-xl px-4 py-3.5 text-stone-100 font-semibold focus:outline-none focus:border-green-500 transition-colors w-full cursor-pointer text-sm"
                  >
                    {ORCHIDS_DATA.map(o => (
                      <option key={o.id} value={o.id}>{o.name.replace(/ \(Orquídea .*\)/, '')}</option>
                    ))}
                  </select>
                </div>

                {/* Field 2: Number of Plants */}
                <div className="flex flex-col gap-2">
                  <label className="text-xs uppercase tracking-wider text-stone-400 font-extrabold">Número de Orquídeas</label>
                  <div className="flex items-center bg-stone-900 border border-stone-800 rounded-xl px-2 h-[50px]">
                    <button 
                      onClick={() => setNumPlants(prev => prev > 1 ? prev - 1 : prev)}
                      className="w-10 h-10 text-xl font-bold rounded-lg hover:bg-stone-805 text-stone-400 hover:text-white transition-colors flex items-center justify-center cursor-pointer"
                    >
                      -
                    </button>
                    <span id="calc-plants-count" className="flex-grow text-center font-bold text-white text-base">{numPlants}</span>
                    <button 
                      onClick={() => setNumPlants(prev => prev + 1)}
                      className="w-10 h-10 text-xl font-bold rounded-lg hover:bg-stone-805 text-stone-400 hover:text-white transition-colors flex items-center justify-center cursor-pointer"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Field 3: Application Method */}
                <div className="flex flex-col gap-2">
                  <label className="text-xs uppercase tracking-wider text-stone-400 font-extrabold">Método de Aplicación</label>
                  <div className="flex bg-stone-900 border border-stone-800 rounded-xl p-1 gap-1 h-[50px] items-center">
                    <button
                      onClick={() => setDilutionType('root')}
                      disabled={calcOrchidId === 'vanda'}
                      className={`flex-1 text-center py-2 text-xs font-bold rounded-lg transition-all ${
                        dilutionType === 'root' && calcOrchidId !== 'vanda'
                          ? 'bg-green-600 text-white shadow-md' 
                          : 'text-stone-400 hover:text-stone-200 cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed'
                      }`}
                    >
                      Riego (Sustrato)
                    </button>
                    <button
                      onClick={() => setDilutionType('spray')}
                      className={`flex-1 text-center py-2 text-xs font-bold rounded-lg transition-all ${
                        dilutionType === 'spray' || calcOrchidId === 'vanda'
                          ? 'bg-green-600 text-white shadow-md' 
                          : 'text-stone-400 hover:text-stone-200 cursor-pointer'
                      }`}
                    >
                      Pulverizado (Foliar)
                    </button>
                  </div>
                </div>

              </div>

              {/* Dosing Results View */}
              <div className="bg-gradient-to-r from-stone-900 to-green-950/20 border border-stone-800 rounded-2xl p-6 flex flex-col md:flex-row gap-6 items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-green-900/40 rounded-xl border border-green-800 text-green-300 flex-shrink-0 animate-bounce-float">
                    <WaterDropIcon className="h-7 w-7" />
                  </div>
                  <div>
                    <span className="block text-[10px] font-extrabold text-stone-400 uppercase tracking-widest mb-1">Dosis Recomendada Total</span>
                    <p className="text-stone-100 text-lg md:text-xl font-bold leading-tight">
                      Disuelve <strong className="text-green-300 text-2xl font-extrabold">{doseResults.ml} ml</strong> de emulsión en <strong className="text-white text-2xl font-extrabold">{doseResults.litres} Litro(s)</strong> de agua.
                    </p>
                  </div>
                </div>
                
                <div className="text-center md:text-right border-t md:border-t-0 border-stone-800 pt-4 md:pt-0 w-full md:w-auto">
                  <span className="block text-[10px] font-extrabold text-stone-400 uppercase tracking-widest mb-1">Frecuencia sugerida</span>
                  <p className="text-white font-extrabold text-lg flex items-center gap-2 justify-center md:justify-end">
                    <span className="inline-block h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
                    {doseResults.frequency}
                  </p>
                </div>
              </div>

              {/* Immediate Navigation Link */}
              <div className="mt-8 text-center">
                <p className="text-xs md:text-sm text-stone-400 font-medium italic">
                  * ¿No tienes la Emulsión de Suelo Urbano en casa aún? Obtén la tuya hoy mismo para nutrir profundamente tus orquídeas.
                </p>
                <div className="mt-4">
                  <a
                    href="#/pedido"
                    className="inline-flex items-center gap-2 text-green-400 hover:text-green-300 font-bold text-sm tracking-wide group transition-all"
                  >
                    <span>Realizar Pedido de Emulsión</span>
                    <ChevronRightIcon className="h-4 w-4 transform transition-transform group-hover:translate-x-1" />
                  </a>
                </div>
              </div>

            </div>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
};

export default OrquideasPage;
