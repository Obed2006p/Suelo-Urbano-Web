import React, { useState, useEffect, useRef } from 'react';
import { resizeImageToBase64 } from '../lib/gardenStorage';
import { getGardenPlants } from '../lib/gardenStorage';
import { 
  SproutIcon, 
  HeartIcon, 
  CalendarIcon, 
  CheckCircleIcon, 
  LockIcon, 
  LeafIcon,
  SearchIcon 
} from './icons/Icons';

// Firebase & Cloudinary integrations
import { 
  collection, 
  doc, 
  setDoc, 
  updateDoc, 
  increment, 
  onSnapshot, 
  query 
} from 'firebase/firestore';
import { db, isFirebaseActive, handleFirestoreError, OperationType } from '../lib/firebase';
import { uploadToCloudinary } from '../lib/cloudinaryService';

export interface MuroPost {
  id: string;
  author: string;
  product: string;
  plantType: string;
  headline: string;
  content: string;
  rating: number; // 1-5
  daysUsed: number;
  image: string; // base64 or URL
  hasBeforeAfter: boolean;
  beforeImage?: string; // Optional before image URL/base64
  likes: number;
  date: string;
  isPreset?: boolean;
}

// Initial community postings (empty for real customer entries)
const PRESET_POSTS: MuroPost[] = [];

const LOCAL_STORAGE_KEY = 'suelo_urbano_muro_posts';
const LIKES_KEY_PREFIX = 'suelo_muro_liked_';

interface MuroResultadosPageProps {
  header: React.ReactNode;
}

const MuroResultadosPage: React.FC<MuroResultadosPageProps> = ({ header }) => {
  const [posts, setPosts] = useState<MuroPost[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [productFilter, setProductFilter] = useState('all');
  const [showAddForm, setShowAddForm] = useState(false);
  const [imageBeforeText, setImageBeforeText] = useState('');
  const [imageAfterText, setImageAfterText] = useState('');
  
  // Form State
  const [formData, setFormData] = useState({
    author: '',
    product: 'Suelo Urbano Premium',
    plantType: '',
    headline: '',
    content: '',
    rating: 5,
    daysUsed: 15,
    image: '',
    beforeImage: '',
    hasBeforeAfter: false
  });
  
  const [isCompresing, setIsCompressing] = useState(false);
  const [isCompresingBefore, setIsCompressingBefore] = useState(false);
  const [isUploading, setIsUploading] = useState(false); // Cloudinary uploading progress
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState(false);
  const [likedPosts, setLikedPosts] = useState<{ [key: string]: boolean }>({});
  
  // Toggle viewer for before/after posts
  const [visibleHistoryToggle, setVisibleHistoryToggle] = useState<{ [key: string]: 'before' | 'after' }>({});

  const fileInputRef = useRef<HTMLInputElement>(null);
  const beforeFileInputRef = useRef<HTMLInputElement>(null);

  // Load posts either from real-time Firebase cloud flow, or from local storage fallback
  useEffect(() => {
    let unsubscribe: () => void = () => {};

    if (isFirebaseActive) {
      try {
        const postsRef = collection(db, 'muro_posts');
        const q = query(postsRef);
        
        unsubscribe = onSnapshot(q, (snapshot) => {
          const dbPosts: MuroPost[] = [];
          snapshot.forEach((docSnap) => {
            dbPosts.push(docSnap.data() as MuroPost);
          });
          
          // Sort Firestore posts so that newer posts (higher timestamp / id suffix) appear top
          dbPosts.sort((a, b) => {
            // Compare dates or fall back to ID
            const dateA = new Date(a.date).getTime() || 0;
            const dateB = new Date(b.date).getTime() || 0;
            if (dateA !== dateB) return dateB - dateA;
            return b.id.localeCompare(a.id);
          });

          // Join Firestore live cloud feed together with our elegant core static presets
          const merged = [...dbPosts, ...PRESET_POSTS];
          setPosts(merged);

          // Build local responsive image comparisons on-the-fly
          setVisibleHistoryToggle(prev => {
            const next = { ...prev };
            merged.forEach(p => {
              if (p.hasBeforeAfter && next[p.id] === undefined) {
                next[p.id] = 'after';
              }
            });
            return next;
          });

          // Sync voting triggers from localStorage
          setLikedPosts(prev => {
            const next = { ...prev };
            merged.forEach(p => {
              const isLiked = localStorage.getItem(`${LIKES_KEY_PREFIX}${p.id}`) === 'true';
              if (isLiked) {
                next[p.id] = true;
              }
            });
            return next;
          });
        }, (error) => {
          console.warn("Firestore onSnapshot error, falling back dynamically:", error);
          handleFirestoreError(error, OperationType.GET, 'muro_posts');
        });
      } catch (err) {
        console.error("Failed to query live firestore streams:", err);
      }
    } else {
      // Local fallback mode
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      let loadedPosts = [...PRESET_POSTS];
      if (saved) {
        try {
          const parsed = JSON.parse(saved) as MuroPost[];
          loadedPosts = [...parsed, ...PRESET_POSTS];
        } catch (e) {
          console.error("Error reading saved local-only muro posts:", e);
        }
      }
      setPosts(loadedPosts);

      const initialLikes: { [key: string]: boolean } = {};
      loadedPosts.forEach(p => {
        const isLiked = localStorage.getItem(`${LIKES_KEY_PREFIX}${p.id}`) === 'true';
        if (isLiked) {
          initialLikes[p.id] = true;
        }
      });
      setLikedPosts(initialLikes);

      const initialToggles: { [key: string]: 'before' | 'after' } = {};
      loadedPosts.forEach(p => {
        if (p.hasBeforeAfter) {
          initialToggles[p.id] = 'after';
        }
      });
      setVisibleHistoryToggle(initialToggles);
    }

    return () => {
      unsubscribe();
    };
  }, []);

  const savePostsToLocal = (newCustomPostsOnly: MuroPost[]) => {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(newCustomPostsOnly));
  };

  const handleLike = async (postId: string) => {
    const isLiked = !!likedPosts[postId];
    const itemKey = `${LIKES_KEY_PREFIX}${postId}`;

    if (isLiked) {
      // Unlike Operation
      localStorage.removeItem(itemKey);
      setLikedPosts(prev => ({ ...prev, [postId]: false }));
      setPosts(prev => prev.map(p => p.id === postId ? { ...p, likes: Math.max(0, p.likes - 1) } : p));
      
      if (isFirebaseActive && !postId.startsWith('preset-')) {
        try {
          const postRef = doc(db, 'muro_posts', postId);
          await updateDoc(postRef, {
            likes: increment(-1)
          });
        } catch (err) {
          console.error("Firestore unlike synchrony failed:", err);
        }
      } else {
        const customOnes = posts.filter(p => !p.isPreset).map(p => p.id === postId ? { ...p, likes: Math.max(0, p.likes - 1) } : p);
        savePostsToLocal(customOnes);
      }
    } else {
      // Like Operation
      localStorage.setItem(itemKey, 'true');
      setLikedPosts(prev => ({ ...prev, [postId]: true }));
      setPosts(prev => prev.map(p => p.id === postId ? { ...p, likes: p.likes + 1 } : p));

      if (isFirebaseActive && !postId.startsWith('preset-')) {
        try {
          const postRef = doc(db, 'muro_posts', postId);
          await updateDoc(postRef, {
            likes: increment(1)
          });
        } catch (err) {
          console.error("Firestore like synchrony failed:", err);
        }
      } else {
        const customOnes = posts.filter(p => !p.isPreset).map(p => p.id === postId ? { ...p, likes: p.likes + 1 } : p);
        savePostsToLocal(customOnes);
      }
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>, isBefore = false) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (isBefore) {
        setIsCompressingBefore(true);
        try {
          const compressed = await resizeImageToBase64(file, 450);
          setFormData(prev => ({ ...prev, beforeImage: compressed }));
          setImageBeforeText(file.name);
        } catch (err) {
          console.error(err);
          setFormError('No se pudo procesar la foto de antes.');
        } finally {
          setIsCompressingBefore(false);
        }
      } else {
        setIsCompressing(true);
        try {
          const compressed = await resizeImageToBase64(file, 450);
          setFormData(prev => ({ ...prev, image: compressed }));
          setImageAfterText(file.name);
        } catch (err) {
          console.error(err);
          setFormError('No se pudo procesar la foto de resultado.');
        } finally {
          setIsCompressing(false);
        }
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!formData.author.trim()) {
      setFormError('Por favor ingresa tu nombre o apodo.');
      return;
    }
    if (!formData.plantType.trim()) {
      setFormError('Por favor indica el tipo de planta (ej. Rosal, Helecho).');
      return;
    }
    if (!formData.headline.trim()) {
      setFormError('Por favor escribe un título llamativo para tu resultado.');
      return;
    }
    if (!formData.content.trim()) {
      setFormError('Por favor agrega la descripción de tus resultados.');
      return;
    }
    if (!formData.image) {
      setFormError('Por favor sube una foto del resultado de tu hermosa planta.');
      return;
    }
    if (formData.hasBeforeAfter && !formData.beforeImage) {
      setFormError('Has activado la comparación de "Antes de usar". Sube una foto de antes.');
      return;
    }

    setIsUploading(true);
    let finalImageUrl = '';
    let finalBeforeImageUrl = '';

    try {
      // 1. Upload main showcase image to Cloudinary (will return secure HTTPS URL)
      if (formData.image.startsWith('data:')) {
        finalImageUrl = await uploadToCloudinary(formData.image);
      } else {
        finalImageUrl = formData.image;
      }

      // 2. Upload optionally before image to Cloudinary
      if (formData.hasBeforeAfter && formData.beforeImage) {
        if (formData.beforeImage.startsWith('data:')) {
          finalBeforeImageUrl = await uploadToCloudinary(formData.beforeImage);
        } else {
          finalBeforeImageUrl = formData.beforeImage;
        }
      }
    } catch (uploadErr) {
      console.error("Cloudinary upload failed:", uploadErr);
      setFormError('Ocurrió un inconveniente al subir tus fotos a Cloudinary. Por favor reintenta.');
      setIsUploading(false);
      return;
    }

    const customId = 'custom-' + Math.random().toString(36).substr(2, 9);
    const newPost: MuroPost = {
      id: customId,
      author: formData.author.trim(),
      product: formData.product,
      plantType: formData.plantType.trim(),
      headline: formData.headline.trim(),
      content: formData.content.trim(),
      rating: formData.rating,
      daysUsed: formData.daysUsed,
      image: finalImageUrl,
      hasBeforeAfter: formData.hasBeforeAfter,
      beforeImage: formData.hasBeforeAfter ? finalBeforeImageUrl : undefined,
      likes: 0,
      date: new Date().toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric' })
    };

    if (isFirebaseActive) {
      try {
        // Safe persist to Firestore
        await setDoc(doc(db, 'muro_posts', customId), newPost);
      } catch (firestoreErr) {
        console.error("Firestore persistence error:", firestoreErr);
        handleFirestoreError(firestoreErr, OperationType.CREATE, `muro_posts/${customId}`);
      }
    } else {
      // Offline fallback
      const currentCustomOnes = posts.filter(p => !p.isPreset);
      const updatedCustomOnes = [newPost, ...currentCustomOnes];
      savePostsToLocal(updatedCustomOnes);
      setPosts([newPost, ...posts]);
    }

    setIsUploading(false);
    
    // Succcess message & Reset Form
    setFormSuccess(true);
    setTimeout(() => {
      setFormSuccess(false);
      setShowAddForm(false);
      // Reset
      setFormData({
        author: '',
        product: 'Suelo Urbano Premium',
        plantType: '',
        headline: '',
        content: '',
        rating: 5,
        daysUsed: 15,
        image: '',
        beforeImage: '',
        hasBeforeAfter: false
      });
      setImageBeforeText('');
      setImageAfterText('');
    }, 2000);
  };

  const toggleHistoryView = (postId: string, mode: 'before' | 'after') => {
    setVisibleHistoryToggle(prev => ({ ...prev, [postId]: mode }));
  };

  // Filter posts based on search query and product productFilter
  const filteredPosts = posts.filter(post => {
    const query = searchQuery.toLowerCase();
    const matchesSearch = 
      post.author.toLowerCase().includes(query) ||
      post.plantType.toLowerCase().includes(query) ||
      post.headline.toLowerCase().includes(query) ||
      post.content.toLowerCase().includes(query);
      
    const matchesProduct = productFilter === 'all' || post.product.toLowerCase().includes(productFilter.toLowerCase());
    
    return matchesSearch && matchesProduct;
  });

  return (
    <div className="min-h-screen bg-stone-900/90 text-stone-100 flex flex-col">
      {header}
      
      {/* Decorative floral background indicators to align with beautiful Swiss/Modern aesthetics */}
      <div className="absolute top-20 right-10 opacity-5 pointer-events-none w-96 h-96 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-lime-500 via-emerald-600 to-transparent -z-10 animate-pulse duration-10000" />
      <div className="absolute bottom-10 left-10 opacity-5 pointer-events-none w-80 h-80 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-yellow-500 via-green-600 to-transparent -z-10" />

      <main className="flex-grow container mx-auto px-4 max-w-7xl py-8">
        
        {/* Upper Title Section */}
        <section className="text-center mb-10 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-lime-950/50 border border-lime-800/60 rounded-full text-lime-400 text-xs font-semibold mb-3 tracking-wide">
            <SproutIcon className="w-3.5 h-3.5" />
            <span>RESULTADOS DE CO-CREADORES</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-white leading-tight tracking-tight mb-4 select-none">
            Muro de <span className="bg-gradient-to-r from-lime-400 to-emerald-400 bg-clip-text text-transparent">Resultados Suelo Urbano</span>
          </h1>
          <p className="text-stone-300 text-sm sm:text-base font-normal leading-relaxed">
            Explora fotos, testimonios y los asombrosos cambios reales de las plantas de nuestra comunidad utilizando la emulsión de Suelo Urbano.
          </p>
        </section>

        {/* Global Statistics Grid */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Testimonios Compartidos', value: '128+', color: 'text-lime-400' },
            { label: 'Efectividad Promedio', value: '4.9 / 5.0 ★', color: 'text-yellow-300' },
            { label: 'Plantas Salvadas', value: '98.4%', color: 'text-emerald-400' },
            { label: 'Comunidad Unida', value: 'Activa', color: 'text-white' }
          ].map((stat, i) => (
            <div key={i} className="bg-stone-850/60 p-4 rounded-2xl border border-stone-800 flex flex-col justify-center items-center text-center shadow-lg">
              <span className="text-[10px] sm:text-xs text-stone-400 uppercase font-semibold tracking-wider mb-1">{stat.label}</span>
              <span className={`text-xl sm:text-2xl font-black ${stat.color}`}>{stat.value}</span>
            </div>
          ))}
        </section>

        {/* Controls, Filters & Actions Bar */}
        <section className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-stone-850/80 p-4 rounded-2xl border border-stone-800 shadow-xl mb-8">
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto flex-1">
            
            {/* Search Input */}
            <div className="relative w-full sm:w-72">
              <span className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-stone-400">
                <SearchIcon className="h-4 w-4" />
              </span>
              <input 
                type="text" 
                placeholder="Buscar planta, producto..." 
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full bg-stone-900 border border-stone-750 focus:border-lime-500 text-stone-100 placeholder-stone-450 pl-10 pr-4 py-2 rounded-xl text-sm transition-all focus:outline-none"
              />
            </div>

            {/* Product Switch */}
            <div className="relative w-full sm:w-56">
              <select 
                value={productFilter}
                onChange={e => setProductFilter(e.target.value)}
                className="w-full bg-stone-900 border border-stone-750 focus:border-lime-500 text-stone-100 py-2 px-3 rounded-xl text-sm transition-all focus:outline-none cursor-pointer appearance-none"
              >
                <option value="all">Filtro: Todos los productos</option>
                <option value="Premium">Suelo Urbano Premium</option>
                <option value="SU-BIO">SU-BIO (Microvida)</option>
                <option value="SU-ORQUI">SU-ORQUI (Orquídeas)</option>
                <option value="SU-JARDI">SU-JARDI (Nutrición)</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3.5 text-stone-400">
                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
              </div>
            </div>
          </div>

          <button 
            onClick={() => setShowAddForm(!showAddForm)}
            className="w-full sm:w-auto bg-gradient-to-r from-lime-600 to-emerald-600 hover:from-lime-500 hover:to-emerald-500 text-white font-extrabold py-2.5 px-6 rounded-xl text-sm flex items-center justify-center gap-2 cursor-pointer shadow-md transform hover:-translate-y-0.5 transition-all"
          >
            <span className="text-lg">+</span>
            <span>Subir mi Testimonio & Foto</span>
          </button>
        </section>

        {/* Expandable Form: Add post testimonio */}
        {showAddForm && (
          <section className="bg-stone-850 border border-lime-600/30 rounded-3xl p-6 mb-8 shadow-2xl relative animate-fade-in-up">
            <div className="flex justify-between items-center mb-6 border-b border-stone-800 pb-4">
              <div>
                <h3 className="text-xl font-bold text-white leading-tight">Escribe tu historia de éxito Suelo Urbano 🌸</h3>
                <p className="text-xs text-stone-400 mt-1">Comparte con otros amantes de las plantas los asombrosos cambios de tu jardín.</p>
              </div>
              <button 
                onClick={() => setShowAddForm(false)} 
                className="text-stone-400 hover:text-white p-2 rounded-full hover:bg-stone-800 transition-colors"
                aria-label="Cerrar formulario"
              >
                ✕
              </button>
            </div>

            {formSuccess ? (
              <div className="py-8 text-center flex flex-col justify-center items-center gap-3">
                <div className="bg-lime-950 p-4 rounded-full border border-lime-500">
                  <CheckCircleIcon className="w-10 h-10 text-lime-400" />
                </div>
                <h4 className="text-lg font-bold text-white">¡Testimonio publicado con éxito!</h4>
                <p className="text-xs text-stone-300">Tus resultados están guardados y listos en tu muro comunitario local.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {formError && (
                  <div className="bg-red-950/70 border border-red-550/50 p-3 rounded-xl text-xs text-red-350 font-medium">
                    ⚠️ {formError}
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Name */}
                  <div>
                    <label className="block text-xs text-stone-350 font-bold mb-1.5 uppercase tracking-wide">Tu Nombre o Apodo</label>
                    <input 
                      type="text" 
                      placeholder="Ej. Doña Teresa / Don Carlos S." 
                      value={formData.author}
                      onChange={e => setFormData(prev => ({ ...prev, author: e.target.value }))}
                      className="w-full bg-stone-900 border border-stone-750 focus:border-lime-500 rounded-xl px-4 py-2.5 text-xs text-white placeholder-stone-500 focus:outline-none"
                    />
                  </div>

                  {/* Product used */}
                  <div>
                    <label className="block text-xs text-stone-350 font-bold mb-1.5 uppercase tracking-wide">Producto Suelo Urbano Usado</label>
                    <select
                      value={formData.product}
                      onChange={e => setFormData(prev => ({ ...prev, product: e.target.value }))}
                      className="w-full bg-stone-900 border border-stone-750 focus:border-lime-500 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none cursor-pointer"
                    >
                      <option value="Suelo Urbano Premium">Suelo Urbano Premium</option>
                      <option value="SU-BIO (Microvida Activa)">SU-BIO (Microvida Activa)</option>
                      <option value="SU-ORQUI (Especial Orquídeas)">SU-ORQUI (Especial Orquídeas)</option>
                      <option value="SU-JARDI (Nutrición General)">SU-JARDI (Nutrición General)</option>
                      <option value="Suelo Urbano Club Premium">Suelo Urbano Club Premium</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Plant type */}
                  <div>
                    <label className="block text-xs text-stone-350 font-bold mb-1.5 uppercase tracking-wide">Tipo de Planta</label>
                    <input 
                      type="text" 
                      placeholder="Ej. Rosa de Castilla / Helecho Colgante" 
                      value={formData.plantType}
                      onChange={e => setFormData(prev => ({ ...prev, plantType: e.target.value }))}
                      className="w-full bg-stone-900 border border-stone-750 focus:border-lime-500 rounded-xl px-4 py-2.5 text-xs text-white placeholder-stone-500 focus:outline-none"
                    />
                  </div>

                  {/* Days used */}
                  <div>
                    <label className="block text-xs text-stone-350 font-bold mb-1.5 uppercase tracking-wide">Días de Uso / Aplicación</label>
                    <input 
                      type="number" 
                      min="1" 
                      placeholder="Ej. 15, 30" 
                      value={formData.daysUsed}
                      onChange={e => setFormData(prev => ({ ...prev, daysUsed: parseInt(e.target.value) || 0 }))}
                      className="w-full bg-stone-900 border border-stone-750 focus:border-lime-500 rounded-xl px-4 py-2.5 text-xs text-white placeholder-stone-500 focus:outline-none"
                    />
                  </div>

                  {/* Rating Hojas */}
                  <div>
                    <label className="block text-xs text-stone-350 font-bold mb-1.5 uppercase tracking-wide">Calificación del Resultado</label>
                    <div className="flex items-center gap-2 mt-2">
                      {[1, 2, 3, 4, 5].map((count) => (
                        <button
                          key={count}
                          type="button"
                          onClick={() => setFormData(prev => ({ ...prev, rating: count }))}
                          className="focus:outline-none text-2xl transition-transform hover:scale-125"
                          title={`${count} Hojas de efectividad`}
                        >
                          <span className={formData.rating >= count ? "text-lime-400" : "text-stone-700"}>
                            🍃
                          </span>
                        </button>
                      ))}
                      <span className="text-[11px] text-stone-400 ml-2 font-bold uppercase">{formData.rating} / 5</span>
                    </div>
                  </div>
                </div>

                {/* Headline input */}
                <div>
                  <label className="block text-xs text-stone-350 font-bold mb-1.5 uppercase tracking-wide">Título del Avance / Resultado Especial</label>
                  <input 
                    type="text" 
                    placeholder="Ej. ¡Mi planta revivió y duplicó el tamaño de sus flores en tiempo récord!" 
                    value={formData.headline}
                    onChange={e => setFormData(prev => ({ ...prev, headline: e.target.value }))}
                    className="w-full bg-stone-900 border border-stone-750 focus:border-lime-500 rounded-xl px-4 py-2.5 text-xs text-white placeholder-stone-500 focus:outline-none"
                  />
                </div>

                {/* Content description */}
                <div>
                  <label className="block text-xs text-stone-350 font-bold mb-1.5 uppercase tracking-wide">Tu Historia y Experiencia Completa</label>
                  <textarea 
                    rows={4}
                    placeholder="Cuéntanos: ¿cómo estaba tu planta de salud al inicio?, ¿en cuánto tiempo notaste los brotes nuevos?, ¿por qué recomendarías Suelo Urbano?... ¡Nos emociona leerte!" 
                    value={formData.content}
                    onChange={e => setFormData(prev => ({ ...prev, content: e.target.value }))}
                    className="w-full bg-stone-900 border border-stone-750 focus:border-lime-500 rounded-xl p-4 text-xs text-white placeholder-stone-500 focus:outline-none resize-none"
                  />
                </div>

                {/* Compare toggle switch */}
                <div className="flex items-center gap-3 py-2 border-t border-b border-stone-800/80 my-4">
                  <input 
                    type="checkbox" 
                    id="has-before-after" 
                    checked={formData.hasBeforeAfter}
                    onChange={e => setFormData(prev => ({ ...prev, hasBeforeAfter: e.target.checked }))}
                    className="h-4.5 w-4.5 rounded text-lime-500 focus:ring-lime-500 border-stone-750 bg-stone-900 cursor-pointer"
                  />
                  <label htmlFor="has-before-after" className="text-xs sm:text-sm font-semibold text-stone-200 cursor-pointer select-none">
                    Comparar "Antes y Después" (Subir 2 Fotos)
                  </label>
                </div>

                {/* File upload images section */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  
                  {/* Photo "After" - Result (Mandatory) */}
                  <div className="bg-stone-900/40 p-4 border border-stone-800 rounded-2xl">
                    <label className="block text-xs text-stone-300 font-extrabold mb-1 uppercase tracking-wide">
                      📸 Foto Final / Resultado (Obligatoria)
                    </label>
                    <p className="text-[10px] text-stone-400 mb-3">Sube la mejor foto del estado sano o floración de tu planta.</p>
                    
                    <div className="flex flex-col gap-3">
                      <input 
                        type="file" 
                        accept="image/*"
                        ref={fileInputRef}
                        onChange={e => handleFileChange(e, false)}
                        className="hidden"
                      />
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isCompresing}
                        className="w-full bg-stone-900 hover:bg-stone-800 text-stone-300 font-semibold py-2.5 px-4 rounded-xl text-xs border border-stone-700 hover:border-lime-500/50 flex items-center justify-center gap-2 transition-all cursor-pointer"
                      >
                        {isCompresing ? (
                          <div className="w-4.5 h-4.5 border-2 border-stone-550 border-t-lime-500 rounded-full animate-spin" />
                        ) : '📁 Seleccionar Imagen'}
                      </button>
                      
                      {imageAfterText && (
                        <div className="text-[10px] text-lime-400 font-medium bg-lime-950/40 p-2 rounded-lg border border-lime-850 truncate">
                          ✓ {imageAfterText} (Comprimido con éxito para caché libre)
                        </div>
                      )}

                      {formData.image && (
                        <div className="aspect-video w-full rounded-lg overflow-hidden border border-stone-750 mt-1 bg-black flex justify-center items-center">
                          <img src={formData.image} alt="Previsualización de resultado" className="object-contain h-full w-full" />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Photo "Before" (Conditional on checked box) */}
                  {formData.hasBeforeAfter && (
                    <div className="bg-stone-900/40 p-4 border border-stone-800 rounded-2xl animate-fade-in-up">
                      <label className="block text-xs text-stone-350 font-extrabold mb-1 uppercase tracking-wide">
                        🥀 Foto de "Antes de usar" (Obligatoria si marcas comparación)
                      </label>
                      <p className="text-[10px] text-stone-400 mb-3">Sube la foto de cómo estaba tu planta marchita antes de Suelo Urbano.</p>
                      
                      <div className="flex flex-col gap-3">
                        <input 
                          type="file" 
                          accept="image/*"
                          ref={beforeFileInputRef}
                          onChange={e => handleFileChange(e, true)}
                          className="hidden"
                        />
                        <button
                          type="button"
                          onClick={() => beforeFileInputRef.current?.click()}
                          disabled={isCompresingBefore}
                          className="w-full bg-stone-900 hover:bg-stone-800 text-stone-300 font-semibold py-2.5 px-4 rounded-xl text-xs border border-stone-700 hover:border-lime-500/50 flex items-center justify-center gap-2 transition-all cursor-pointer"
                        >
                          {isCompresingBefore ? (
                            <div className="w-4.5 h-4.5 border-2 border-stone-550 border-t-lime-500 rounded-full animate-spin" />
                          ) : '📁 Seleccionar Imagen "Antes"'}
                        </button>
                        
                        {imageBeforeText && (
                          <div className="text-[10px] text-yellow-400 font-medium bg-yellow-950/40 p-2 rounded-lg border border-yellow-850 truncate">
                            ✓ {imageBeforeText} (Comprimido con éxito)
                          </div>
                        )}

                        {formData.beforeImage && (
                          <div className="aspect-video w-full rounded-lg overflow-hidden border border-stone-750 mt-1 bg-black flex justify-center items-center">
                            <img src={formData.beforeImage} alt="Previsualización de antes" className="object-contain h-full w-full" />
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                </div>

                <div className="pt-4 border-t border-stone-800 flex justify-end gap-3.5">
                  <button 
                    type="button" 
                    onClick={() => setShowAddForm(false)}
                    className="bg-transparent hover:bg-stone-800 border border-stone-700 text-stone-300 font-bold py-2 px-5 rounded-xl text-xs cursor-pointer transition-all"
                  >
                    Cancelar
                  </button>
                  <button 
                    type="submit"
                    disabled={isCompresing || isCompresingBefore || isUploading}
                    className="bg-gradient-to-r from-lime-500 to-emerald-500 hover:from-lime-450 hover:to-emerald-450 text-white font-extrabold py-2 px-7 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-md active:scale-95 disabled:opacity-40"
                  >
                    {isUploading ? (
                      <>
                        <div className="w-3.5 h-3.5 border-2 border-stone-200 border-t-lime-400 rounded-full animate-spin mr-1" />
                        <span>Subiendo a Cloudinary...</span>
                      </>
                    ) : (
                      <span>Publicar mi Resultado</span>
                    )}
                  </button>
                </div>
              </form>
            )}
          </section>
        )}

        {/* Community Results Card Stream! Grid Layout */}
        {filteredPosts.length === 0 ? (
          <div className="bg-stone-850 p-12 text-center rounded-3xl border border-stone-800 shadow-xl max-w-lg mx-auto">
            <span className="text-4xl">🥀</span>
            <h4 className="text-lg font-bold text-white mt-4">No se encontraron testimonios</h4>
            <p className="text-xs text-stone-400 mt-2">Prueba alterando las palabras de tu búsqueda o el filtro de producto.</p>
            <button 
              onClick={() => { setSearchQuery(''); setProductFilter('all'); }} 
              className="mt-4 bg-stone-900 border border-stone-750 text-stone-300 font-bold text-xs py-2 px-4 rounded-xl hover:bg-stone-800 transition-colors cursor-pointer"
            >
              Limpiar Filtros
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
            {filteredPosts.map((post) => {
              const viewerMode = visibleHistoryToggle[post.id] || 'after';
              const hasLiked = !!likedPosts[post.id];

              return (
                <article 
                  key={post.id} 
                  className="bg-stone-850/90 border border-stone-800 rounded-3xl shadow-xl flex flex-col h-full overflow-hidden transform transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_15px_30px_rgba(0,0,0,0.4)]"
                >
                  
                  {/* Title / Badge bar */}
                  <div className="p-4 sm:p-5 flex justify-between items-center bg-stone-900/40 border-b border-stone-800/60">
                    <div className="min-w-0">
                      <span className="inline-flex items-center px-2.5 py-0.5 bg-lime-950/40 border border-lime-850/60 rounded-full text-lime-400 text-[10px] font-bold tracking-wide mr-2 uppercase">
                        {post.plantType}
                      </span>
                      <span className="inline-block text-[11px] font-medium text-stone-400 mt-1 sm:mt-0">
                        {post.date}
                      </span>
                    </div>

                    <div className="text-[10.5px] font-bold px-2.5 py-1 bg-stone-900 border border-stone-800/80 rounded-lg text-emerald-400 text-right truncate max-w-[140px] sm:max-w-[200px]">
                      {post.product}
                    </div>
                  </div>

                  {/* Progressive visual display: with Before/After switch option */}
                  <div className="relative aspect-video bg-black/40 overflow-hidden border-b border-stone-800/80">
                    
                    {/* Main Showcase Image depending on before or after selection */}
                    {post.hasBeforeAfter ? (
                      <div className="w-full h-full relative">
                        {viewerMode === 'before' ? (
                          <img 
                            src={post.beforeImage} 
                            alt={`${post.plantType} antes de usar emulsión`} 
                            className="w-full h-full object-cover transition-all"
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          <img 
                            src={post.image} 
                            alt={`${post.plantType} después de usar emulsión`} 
                            className="w-full h-full object-cover transition-all"
                            referrerPolicy="no-referrer"
                          />
                        )}
                        
                        {/* Selector/Switch labels directly overlaid on top of image with luxury styles */}
                        <div className="absolute top-3 left-3 bg-black/70 backdrop-blur-sm border border-stone-800/80 rounded-full py-1 px-1.5 flex gap-1 z-10">
                          <button
                            onClick={() => toggleHistoryView(post.id, 'before')}
                            className={`px-3 py-1 font-bold text-[10px] rounded-full transition-all cursor-pointer ${
                              viewerMode === 'before' 
                                ? 'bg-amber-900/80 text-amber-300' 
                                : 'text-stone-400 hover:text-white'
                            }`}
                          >
                            Antes de usar
                          </button>
                          <button
                            onClick={() => toggleHistoryView(post.id, 'after')}
                            className={`px-3 py-1 font-bold text-[10px] rounded-full transition-all cursor-pointer ${
                              viewerMode === 'after' 
                                ? 'bg-emerald-950 text-emerald-400 border border-green-800/50' 
                                : 'text-stone-400 hover:text-white'
                            }`}
                          >
                            Con Suelo Urbano
                          </button>
                        </div>
                        
                        {/* Interactive badge indicating current timeline */}
                        <div className="absolute right-3 top-3 bg-black/60 text-white backdrop-blur-sm font-black text-[10px] uppercase tracking-wider py-1 px-2.5 rounded-md border border-stone-800">
                          {viewerMode === 'before' ? '🥀 Estado Inicial' : `🍃 Resultado (${post.daysUsed} días)`}
                        </div>

                      </div>
                    ) : (
                      <div className="w-full h-full relative">
                        <img 
                          src={post.image} 
                          alt={post.headline} 
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                        <div className="absolute right-3 top-3 bg-black/60 text-emerald-300 backdrop-blur-sm font-black text-[10px] uppercase tracking-wider py-1 px-2.5 rounded-md border border-stone-800">
                          🍃 {post.daysUsed} Días Aplicando
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Body Text & Success Description */}
                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <div className="mb-4">
                      {/* Leaf Indicator Representation */}
                      <div className="flex items-center gap-1.5 mb-2.5">
                        <div className="flex gap-1">
                          {[1, 2, 3, 4, 5].map((val) => (
                            <span 
                              key={val} 
                              className={`text-sm ${
                                post.rating >= val ? "text-lime-400 filter drop-shadow-[0_0_2px_rgba(163,230,53,0.5)]" : "text-stone-700"
                              }`}
                            >
                              🍃
                            </span>
                          ))}
                        </div>
                        <span className="text-[10px] text-stone-450 uppercase font-bold ml-1 tracking-wider">
                          Eficacia • {post.rating} / 5
                        </span>
                      </div>

                      {/* Headline */}
                      <h3 className="text-lg font-black text-white leading-tight mb-2 select-text">
                        "{post.headline}"
                      </h3>

                      {/* Content */}
                      <p className="text-stone-300 text-xs sm:text-sm leading-relaxed whitespace-pre-line font-normal text-justify select-text">
                        {post.content}
                      </p>
                    </div>

                    {/* Author & Clap likes Interaction container */}
                    <div className="flex justify-between items-center pt-4 border-t border-stone-800/80 mt-auto bg-stone-900/10">
                      
                      {/* Author nickname */}
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-stone-800 border border-stone-750 flex items-center justify-center text-xs text-lime-400 font-extrabold select-none">
                          {post.author.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-xs font-bold text-white leading-none">{post.author}</p>
                          <p className="text-[10px] text-stone-450 font-semibold tracking-wide uppercase mt-0.5">
                            🌟 Cliente Certificado
                          </p>
                        </div>
                      </div>

                      {/* Action Applaud/Like button */}
                      <button 
                        onClick={() => handleLike(post.id)}
                        className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl border font-bold text-xs transition-all duration-200 cursor-pointer active:scale-95 ${
                          hasLiked 
                            ? 'bg-lime-950 border-lime-800 text-lime-300 shadow-[0_0_12px_rgba(163,230,53,0.15)]' 
                            : 'bg-stone-900 border-stone-800 text-stone-400 hover:text-white hover:border-stone-700'
                        }`}
                        title={hasLiked ? "Ya no me gusta" : "¡Me inspira este resultado!"}
                      >
                        <HeartIcon className={`h-4.5 w-4.5 transition-transform duration-300 ${hasLiked ? 'fill-lime-400 text-lime-400 scale-125' : 'text-current'}`} />
                        <span>{post.likes}</span>
                      </button>

                    </div>

                  </div>
                </article>
              );
            })}
          </div>
        )}

      </main>
    </div>
  );
};

export default MuroResultadosPage;
