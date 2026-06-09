import React, { useState, useEffect, useRef } from 'react';
import { resizeImageToBase64 } from '../lib/gardenStorage';
import { 
  SproutIcon, 
  HeartIcon, 
  CalendarIcon, 
  CheckCircleIcon, 
  LockIcon, 
  LeafIcon,
  SearchIcon,
  SparklesIcon,
  CameraIcon,
  XIcon
} from './icons/Icons';

// Firebase & Cloudinary integrations
import { 
  collection, 
  doc, 
  setDoc, 
  updateDoc, 
  deleteDoc,
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
  price?: string; // New: price tag
  isPreset?: boolean;
}

// Client sell request submittor
export interface MuralSolicitud {
  id: string;
  clientName: string;
  clientContact: string; // WhatsApp, email etc
  plantType: string;
  description: string;
  price: string;
  image: string; // base64 or URL
  date: string;
  status: 'pending' | 'approved' | 'rejected';
}

const LOCAL_STORAGE_KEY = 'suelo_urbano_muro_posts';
const LOCAL_SOLICITUDES_KEY = 'suelo_urbano_mural_solicitudes';
const LIKES_KEY_PREFIX = 'suelo_muro_liked_';

const VIP_CODES = [
  'SU-VIP-DEVELOPER',
  'VIP-SUELO-2026',
  'VIP-DEVELOPER',
  'SUVIP',
  'VIP'
];

interface MuroResultadosPageProps {
  header: React.ReactNode;
}

const MuroResultadosPage: React.FC<MuroResultadosPageProps> = ({ header }) => {
  const [posts, setPosts] = useState<MuroPost[]>([]);
  const [solicitudes, setSolicitudes] = useState<MuralSolicitud[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Access levels and passcode gates
  const [isVipMode, setIsVipMode] = useState<boolean>(() => {
    const savedCode = localStorage.getItem('suelo_urbano_premium_code') || '';
    return VIP_CODES.includes(savedCode.trim().toUpperCase());
  });
  const [vipCodeInput, setVipCodeInput] = useState('');
  const [vipError, setVipError] = useState('');
  const [showVipTrigger, setShowVipTrigger] = useState(false);

  // General forms toggles
  const [showAddForm, setShowAddForm] = useState(false);
  const [showSendForm, setShowSendForm] = useState(false); // form for clients to send submissions

  // Image Upload Text Indicators
  const [imageBeforeText, setImageBeforeText] = useState('');
  const [imageAfterText, setImageAfterText] = useState('');
  const [clientImageText, setClientImageText] = useState('');
  
  // VIP/Admin upload form
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
    hasBeforeAfter: false,
    price: '' // New Price field
  });

  // Client sale request form
  const [clientForm, setClientForm] = useState({
    clientName: '',
    clientContact: '',
    plantType: '',
    description: '',
    price: '',
    image: '',
  });
  
  const [isCompresing, setIsCompressing] = useState(false);
  const [isCompresingBefore, setIsCompressingBefore] = useState(false);
  const [isCompresingClient, setIsCompresingClient] = useState(false);
  const [isUploading, setIsUploading] = useState(false); 
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState(false);

  const [clientFormError, setClientFormError] = useState('');
  const [clientFormSuccess, setClientFormSuccess] = useState(false);
  const [lastSubmittedId, setLastSubmittedId] = useState<string | null>(null);

  const [likedPosts, setLikedPosts] = useState<{ [key: string]: boolean }>({});
  const [visibleHistoryToggle, setVisibleHistoryToggle] = useState<{ [key: string]: 'before' | 'after' }>({});

  const fileInputRef = useRef<HTMLInputElement>(null);
  const beforeFileInputRef = useRef<HTMLInputElement>(null);
  const clientFileInputRef = useRef<HTMLInputElement>(null);

  // Synchronize Posts and Solicitudes
  useEffect(() => {
    let unsubscribePosts: () => void = () => {};
    let unsubscribeSolicitudes: () => void = () => {};

    // 1st snapshot: Muro/Mural Posts
    if (isFirebaseActive) {
      try {
        const postsRef = collection(db, 'muro_posts');
        unsubscribePosts = onSnapshot(query(postsRef), (snapshot) => {
          const dbPosts: MuroPost[] = [];
          snapshot.forEach((docSnap) => {
            dbPosts.push(docSnap.data() as MuroPost);
          });
          
          dbPosts.sort((a, b) => {
            const dateA = new Date(a.date).getTime() || 0;
            const dateB = new Date(b.date).getTime() || 0;
            if (dateA !== dateB) return dateB - dateA;
            return b.id.localeCompare(a.id);
          });

          setPosts(dbPosts);

          // Build view togglers
          setVisibleHistoryToggle(prev => {
            const next = { ...prev };
            dbPosts.forEach(p => {
              if (p.hasBeforeAfter && next[p.id] === undefined) {
                next[p.id] = 'after';
              }
            });
            return next;
          });

          // Sync votes indexes
          setLikedPosts(prev => {
            const next = { ...prev };
            dbPosts.forEach(p => {
              const isLiked = localStorage.getItem(`${LIKES_KEY_PREFIX}${p.id}`) === 'true';
              if (isLiked) {
                next[p.id] = true;
              }
            });
            return next;
          });
        }, (error) => {
          console.warn("Firestore onSnapshot public posts failed, falling back local:", error);
        });

        // 2nd snapshot: Client Solicitudes (Only for review)
        const solicRef = collection(db, 'mural_solicitudes');
        unsubscribeSolicitudes = onSnapshot(query(solicRef), (snapshot) => {
          const dbSolicitudes: MuralSolicitud[] = [];
          snapshot.forEach((docSnap) => {
            dbSolicitudes.push(docSnap.data() as MuralSolicitud);
          });
          dbSolicitudes.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
          setSolicitudes(dbSolicitudes);
        }, (err) => {
          console.warn("Firestore solicitudes fetch failed:", err);
        });

      } catch (err) {
        console.error("Failed to query live Firestore catalogs:", err);
      }
    } else {
      // Local fallback mode: Posts
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      let loadedPosts: MuroPost[] = [];
      if (saved) {
        try {
          loadedPosts = JSON.parse(saved) as MuroPost[];
        } catch (e) {
          console.error("Error reading fallback posts:", e);
        }
      }
      setPosts(loadedPosts);

      // Local fallback mode: Solicitudes
      const savedSol = localStorage.getItem(LOCAL_SOLICITUDES_KEY);
      let loadedSol: MuralSolicitud[] = [];
      if (savedSol) {
        try {
          loadedSol = JSON.parse(savedSol) as MuralSolicitud[];
        } catch (e) {
          console.error("Error reading fallback requests:", e);
        }
      }
      setSolicitudes(loadedSol);

      // Setup initial visual indexes
      const initialLikes: { [key: string]: boolean } = {};
      loadedPosts.forEach(p => {
        if (localStorage.getItem(`${LIKES_KEY_PREFIX}${p.id}`) === 'true') {
          initialLikes[p.id] = true;
        }
      });
      setLikedPosts(initialLikes);

      const initialToggles: { [key: string]: 'before' | 'after' } = {};
      loadedPosts.forEach(p => {
        if (p.hasBeforeAfter) initialToggles[p.id] = 'after';
      });
      setVisibleHistoryToggle(initialToggles);
    }

    return () => {
      unsubscribePosts();
      unsubscribeSolicitudes();
    };
  }, []);

  // Save fallback triggers
  const savePostsToLocal = (updatedList: MuroPost[]) => {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updatedList));
  };

  const saveSolicitudesToLocal = (updatedList: MuralSolicitud[]) => {
    localStorage.setItem(LOCAL_SOLICITUDES_KEY, JSON.stringify(updatedList));
  };

  // Lock status checkers
  const handleVipUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    setVipError('');
    const code = vipCodeInput.trim().toUpperCase();
    if (!code) {
      setVipError('Introduce un código.');
      return;
    }

    if (VIP_CODES.includes(code)) {
      localStorage.setItem('suelo_urbano_premium_code', code);
      setIsVipMode(true);
      setVipCodeInput('');
      setShowVipTrigger(false);
    } else {
      setVipError('Código inválido. Introduce un código VIP premium (Ej: VIP, SUVIP).');
    }
  };

  const handleVipLock = () => {
    localStorage.removeItem('suelo_urbano_premium_code');
    setIsVipMode(false);
  };

  const handleLike = async (postId: string) => {
    const isLiked = !!likedPosts[postId];
    const itemKey = `${LIKES_KEY_PREFIX}${postId}`;

    if (isLiked) {
      // Unlike Operation
      localStorage.removeItem(itemKey);
      setLikedPosts(prev => ({ ...prev, [postId]: false }));
      setPosts(prev => prev.map(p => p.id === postId ? { ...p, likes: Math.max(0, p.likes - 1) } : p));
      
      if (isFirebaseActive) {
        try {
          const postRef = doc(db, 'muro_posts', postId);
          await updateDoc(postRef, {
            likes: increment(-1)
          });
        } catch (err) {
          console.error("Database vote cancellation failed:", err);
        }
      } else {
        const localOnly = posts.map(p => p.id === postId ? { ...p, likes: Math.max(0, p.likes - 1) } : p);
        savePostsToLocal(localOnly);
      }
    } else {
      // Like Operation
      localStorage.setItem(itemKey, 'true');
      setLikedPosts(prev => ({ ...prev, [postId]: true }));
      setPosts(prev => prev.map(p => p.id === postId ? { ...p, likes: p.likes + 1 } : p));
      
      if (isFirebaseActive) {
        try {
          const postRef = doc(db, 'muro_posts', postId);
          await updateDoc(postRef, {
            likes: increment(1)
          });
        } catch (err) {
          console.error("Database voting persistence failed:", err);
        }
      } else {
        const localOnly = posts.map(p => p.id === postId ? { ...p, likes: p.likes + 1 } : p);
        savePostsToLocal(localOnly);
      }
    }
  };

  // Image Compressors
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>, isBefore: boolean = false) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (isBefore) {
      setIsCompressingBefore(true);
      setImageBeforeText(`Cargando y optimizando...`);
      try {
        const base64 = await resizeImageToBase64(file, 800, 800);
        setFormData(prev => ({ ...prev, beforeImage: base64 }));
        setImageBeforeText(`Foto cargada (${(base64.length / 1024).toFixed(0)} KB)`);
      } catch (err) {
        setImageBeforeText("Error al reducir");
      } finally {
        setIsCompressingBefore(false);
      }
    } else {
      setIsCompressing(true);
      setImageAfterText(`Cargando y optimizando...`);
      try {
        const base64 = await resizeImageToBase64(file, 800, 800);
        setFormData(prev => ({ ...prev, image: base64 }));
        setImageAfterText(`Foto cargada (${(base64.length / 1024).toFixed(0)} KB)`);
      } catch (err) {
        setImageAfterText("Error al reducir");
      } finally {
        setIsCompressing(false);
      }
    }
  };

  // Client file picker compressor
  const handleClientFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsCompresingClient(true);
    setClientImageText(`Procesando foto de planta...`);
    try {
      const base64 = await resizeImageToBase64(file, 800, 800);
      setClientForm(prev => ({ ...prev, image: base64 }));
      setClientImageText(`Foto de planta optimizada! (${(base64.length / 1024).toFixed(0)} KB)`);
    } catch (err) {
      setClientImageText("Error al reducir");
    } finally {
      setIsCompresingClient(false);
    }
  };

  // VIP Admin Post Publisher Submit
  const handleVipSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess(false);

    // Validation
    if (!formData.author.trim()) return setFormError('Por favor, indica quién registra o sube la información.');
    if (!formData.plantType.trim()) return setFormError('Especifica el tipo de planta u orquídea.');
    if (!formData.headline.trim()) return setFormError('Elige un título descriptivo para la publicación.');
    if (!formData.content.trim()) return setFormError('Proporciona una descripción detallada para el mural.');
    if (!formData.image) return setFormError('Debes subir al menos una fotografía de la planta.');
    if (formData.hasBeforeAfter && !formData.beforeImage) {
      return setFormError('Marcaste antes/después pero falta la foto del "antes".');
    }

    setIsUploading(true);

    try {
      let finalAfterUrl = formData.image;
      let finalBeforeUrl = formData.beforeImage || '';

      // Upload base64 files to Cloudinary for cloud durability
      if (formData.image.startsWith('data:image')) {
        try {
          finalAfterUrl = await uploadToCloudinary(formData.image);
        } catch (_) {
          console.warn("Unable to store main image in Cloudinary, keeping local data URL.");
        }
      }

      if (formData.beforeImage && formData.beforeImage.startsWith('data:image')) {
        try {
          finalBeforeUrl = await uploadToCloudinary(formData.beforeImage);
        } catch (_) {
          console.warn("Unable to store before image in Cloudinary, keeping local data URL.");
        }
      }

      const customPostId = `custom-${Date.now()}`;
      const newPost: MuroPost = {
        id: customPostId,
        author: formData.author,
        product: formData.product,
        plantType: formData.plantType,
        headline: formData.headline,
        content: formData.content,
        rating: Number(formData.rating),
        daysUsed: Number(formData.daysUsed),
        image: finalAfterUrl,
        beforeImage: formData.beforeImage ? finalBeforeUrl : undefined,
        hasBeforeAfter: formData.hasBeforeAfter,
        likes: 0,
        date: new Date().toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric' }),
        price: formData.price.trim() || undefined
      };

      if (isFirebaseActive) {
        const docRef = doc(db, 'muro_posts', customPostId);
        await setDoc(docRef, newPost);
      } else {
        const nextList = [newPost, ...posts];
        setPosts(nextList);
        savePostsToLocal(nextList);
      }

      // Reset form on success
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
        hasBeforeAfter: false,
        price: ''
      });
      setImageBeforeText('');
      setImageAfterText('');
      
      setFormSuccess(true);
      setShowAddForm(false);
      
      // Auto-dismiss Success message
      setTimeout(() => setFormSuccess(false), 5000);

    } catch (err: any) {
      console.error("Vip catalog publish action failed:", err);
      setFormError('No se pudo publicar la planta. Inténtalo más tarde.');
      if (isFirebaseActive) {
        handleFirestoreError(err, OperationType.CREATE, `muro_posts/new`);
      }
    } finally {
      setIsUploading(false);
    }
  };

  // Client Sale Submitter 
  const handleClientSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setClientFormError('');
    setClientFormSuccess(false);

    if (!clientForm.clientName.trim()) return setClientFormError('Por favor, indica tu nombre para que sepamos quién eres.');
    if (!clientForm.clientContact.trim()) return setClientFormError('Por favor, indica un medio de contacto (ej: WhatsApp o Correo).');
    if (!clientForm.plantType.trim()) return setClientFormError('Escribe el nombre o tipo de planta que quieres vender.');
    if (!clientForm.description.trim()) return setClientFormError('Dinos algunos detalles (salud, edad u origen).');
    if (!clientForm.price.trim()) return setClientFormError('Por favor, escribe el precio sugerido de venta ($).');
    if (!clientForm.image) return setClientFormError('Por favor, carga al menos una foto real de tu planta.');

    setIsUploading(true);

    try {
      let uploadedUrl = clientForm.image;

      // Upload base64 image to Cloudinary
      if (clientForm.image.startsWith('data:image')) {
        try {
          uploadedUrl = await uploadToCloudinary(clientForm.image);
        } catch (_) {
          console.warn("Saving to cloud fallback direct.");
        }
      }

      const submissionId = `solicitud-${Date.now()}`;
      const newSubmission: MuralSolicitud = {
        id: submissionId,
        clientName: clientForm.clientName,
        clientContact: clientForm.clientContact,
        plantType: clientForm.plantType,
        description: clientForm.description,
        price: clientForm.price,
        image: uploadedUrl,
        date: new Date().toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric' }),
        status: 'pending'
      };

      if (isFirebaseActive) {
        const docRef = doc(db, 'mural_solicitudes', submissionId);
        await setDoc(docRef, newSubmission);
      } else {
        const nextList = [newSubmission, ...solicitudes];
        setSolicitudes(nextList);
        saveSolicitudesToLocal(nextList);
      }

      setLastSubmittedId(submissionId);
      setClientFormSuccess(true);
      setShowSendForm(false);
      
      // Clean form
      setClientForm({
        clientName: '',
        clientContact: '',
        plantType: '',
        description: '',
        price: '',
        image: '',
      });
      setClientImageText('');

    } catch (err: any) {
      console.error("Client plant sell registration failed:", err);
      setClientFormError('No pudimos registrar tu planta en este momento, verifica tu conexión.');
    } finally {
      setIsUploading(false);
    }
  };

  // VIP Admin review workflow: prefill VIP publishing form with client submission content
  const handleApproveSolicitud = (sol: MuralSolicitud) => {
    setFormData({
      author: sol.clientName + " (Cliente)",
      product: 'Suelo Urbano Humus / Orgánico',
      plantType: sol.plantType,
      headline: `Planta ofrecida por ${sol.clientName}`,
      content: sol.description + ` | Publicado originalmente por el cliente. Contacto: ${sol.clientContact}`,
      rating: 5,
      daysUsed: 10,
      image: sol.image,
      beforeImage: '',
      hasBeforeAfter: false,
      price: sol.price
    });
    
    // Smooth scroll to top and show form
    setShowAddForm(true);
    window.scrollTo({ top: 300, behavior: 'smooth' });
    
    // Auto fill texts
    setImageAfterText("Cargado de solicitud elegida");
  };

  const handleDismissSolicitud = async (solId: string) => {
    if(!window.confirm("¿Estás seguro de que deseas descartar esta solicitud de cliente?")) return;

    if (isFirebaseActive) {
      try {
        const docRef = doc(db, 'mural_solicitudes', solId);
        await deleteDoc(docRef);
      } catch (err) {
        console.error("Could not delete pending request:", err);
      }
    } else {
      const nextList = solicitudes.filter(s => s.id !== solId);
      setSolicitudes(nextList);
      saveSolicitudesToLocal(nextList);
    }
  };

  // Generate WhatsApp Prefilled click support
  const getWhatsAppURL = (sol: any) => {
    const phone = "525652420968"; // Mexico's +52 followed by 5652420968
    const text = `Hola Suelo Urbano! Quiero vender mi planta mediante su Mural. Mis datos:
- Nombre: ${sol?.clientName || clientForm.clientName}
- Contacto: ${sol?.clientContact || clientForm.clientContact}
- Planta: ${sol?.plantType || clientForm.plantType}
- Precio Sugerido: ${sol?.price || clientForm.price}
- Detalles: ${sol?.description || clientForm.description}`;
    return `https://api.whatsapp.com/send?phone=${phone}&text=${encodeURIComponent(text)}`;
  };

  // Filter list matching search triggers
  const filteredPosts = posts.filter(post => {
    const term = searchQuery.toLowerCase();
    return (
      post.plantType.toLowerCase().includes(term) ||
      post.headline.toLowerCase().includes(term) ||
      post.author.toLowerCase().includes(term) ||
      post.content.toLowerCase().includes(term) ||
      (post.price && post.price.toLowerCase().includes(term))
    );
  });

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 selection:bg-green-700 selection:text-white pb-20">
      {header}

      {/* Decorative floral backgrounds */}
      <div className="absolute top-40 left-10 w-96 h-96 bg-emerald-950/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-40 right-10 w-96 h-96 bg-lime-950/15 rounded-full blur-3xl pointer-events-none" />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10 pt-10">
        
        {/* Breadcrumb back home link */}
        <div className="mb-6 pt-2">
          <a href="#/" className="inline-flex items-center gap-2 text-xs font-extrabold text-stone-400 hover:text-white transition-colors duration-200 uppercase tracking-widest bg-stone-900/60 hover:bg-stone-850/80 p-2.5 px-4 rounded-full border border-stone-800/40">
            <span>←</span> Volver al inicio colectivo
          </a>
        </div>

        {/* Brand Header */}
        <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-6 mb-12 pb-8 border-b border-stone-850">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-green-950/50 border border-green-800/40 rounded-full text-green-400 text-xs font-bold uppercase tracking-widest mb-3">
              <SparklesIcon className="h-3.5 w-3.5" />
              <span>Plantas, Flores y Ofertas</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight leading-none">
              Mural Suelo Urbano ✨
            </h1>
            <p className="text-stone-400 mt-3 text-sm md:text-base max-w-2xl font-medium">
              Te presentamos nuestro catálogo interactivo de plantas y especímenes sanados con alimento orgánico. Revisa precios exclusivos y solicita vender tus plantas directamente en este mural de la comunidad.
            </p>
          </div>

          {/* Access status toggler drawer */}
          <div className="w-full md:w-auto bg-stone-900 border border-stone-830/90 rounded-2xl p-4 shadow-xl">
            <div className="flex items-center justify-between gap-6 mb-2">
              <span className="text-[10px] uppercase font-bold text-stone-450 tracking-wider">Modoficación de Acceso</span>
              {isVipMode ? (
                <button 
                  onClick={handleVipLock}
                  className="text-[10px] bg-red-950 hover:bg-red-900 border border-red-800/60 text-red-300 font-extrabold px-2.5 py-1 rounded-md cursor-pointer transition-colors"
                >
                  Salir de VIP
                </button>
              ) : (
                <button 
                  onClick={() => setShowVipTrigger(!showVipTrigger)}
                  className="text-[10px] bg-emerald-950 hover:bg-emerald-900/70 border border-emerald-800/60 text-emerald-300 font-extrabold px-2.5 py-1 rounded-md cursor-pointer transition-colors"
                >
                  Cambiar a VIP
                </button>
              )}
            </div>

            {isVipMode ? (
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-yellow-400 animate-pulse" />
                <span className="text-xs font-extrabold text-yellow-300">👑 Modo Administrador VIP Habilitado</span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-stone-500" />
                <span className="text-xs font-bold text-stone-300">👤 Acceso: Pantalla Visual Solamente (Cliente)</span>
              </div>
            )}

            {/* Inner credential form */}
            {showVipTrigger && !isVipMode && (
              <form onSubmit={handleVipUnlock} className="mt-3 pt-3 border-t border-stone-800 flex gap-2">
                <input 
                  type="password" 
                  placeholder="Introduce (VIP)"
                  value={vipCodeInput}
                  onChange={(e) => setVipCodeInput(e.target.value)}
                  className="bg-stone-950 border border-stone-850 focus:border-green-600 rounded-lg px-2 py-1 text-xs text-white max-w-[120px] focus:outline-none uppercase font-bold"
                />
                <button type="submit" className="bg-green-700 hover:bg-green-600 text-white font-extrabold text-xs px-3 py-1 rounded-lg cursor-pointer">
                  Entrar
                </button>
              </form>
            )}
            {vipError && <p className="text-[10px] text-red-500 font-bold mt-1 max-w-[200px]">{vipError}</p>}
          </div>
        </div>

        {/* ==============================================
             CLIENT SUBMISSION SUCCESS CORNER
           ============================================== */}
        {clientFormSuccess && (
          <div className="mb-8 p-6 bg-emerald-950/60 border-2 border-emerald-700/80 rounded-3xl relative overflow-hidden shadow-2xl">
            <div className="absolute top-0 right-0 p-3">
              <button onClick={() => setClientFormSuccess(false)} className="text-stone-400 hover:text-white">
                <XIcon className="h-6 w-6" />
              </button>
            </div>
            <div className="flex gap-4 items-start max-w-3xl">
              <div className="p-3 bg-emerald-900 border border-emerald-500 rounded-2xl text-emerald-400 flex-shrink-0 animate-bounce">
                <CheckCircleIcon className="h-8 w-8" />
              </div>
              <div>
                <h3 className="text-xl font-extrabold text-white">¡Muchas gracias, recibimos tu solicitud de venta! 🎉</h3>
                <p className="text-stone-300 text-sm mt-1 leading-relaxed">
                  Guardamos la información de tu planta de forma interna. Nuestro equipo de Suelo Urbano la revisará a la brevedad y, tras validarla, la publicará en el muro con tu precio.
                </p>
                <div className="mt-4 flex flex-wrap gap-3">
                  <a 
                    href={getWhatsAppURL(null)} 
                    target="_blank" 
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-500 text-white font-extrabold text-xs py-2.5 px-5 rounded-xl block transition-all shadow-md active:scale-95"
                  >
                    💬 Enviar detalles por WhatsApp (Acelerar Publicación)
                  </a>
                  <button 
                    onClick={() => setClientFormSuccess(false)}
                    className="bg-stone-900 hover:bg-stone-850 text-stone-300 font-extrabold text-xs py-2.5 px-5 rounded-xl border border-stone-800"
                  >
                    Entendido
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ==============================================
             VIP LOG/CATALOG SUBMISSIONS INBOX REVIEW BOARD
           ============================================== */}
        {isVipMode && solicitudes.length > 0 && (
          <div className="mb-10 bg-gradient-to-br from-yellow-950/20 to-stone-900/40 border border-yellow-800/40 rounded-3xl p-6 shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-7 w-7 bg-yellow-900/40 rounded-full flex items-center justify-center text-yellow-500">
                📬
              </div>
              <h2 className="text-xl font-extrabold text-white">
                Bandeja de Solicitudes de Clientes ({solicitudes.length})
              </h2>
              <span className="ml-auto bg-yellow-405/20 text-yellow-400 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border border-yellow-500/20 uppercase tracking-wider animate-pulse">
                Acción VIP Requerida
              </span>
            </div>
            <p className="text-stone-400 text-xs mb-6 max-w-3xl leading-relaxed">
              Las siguientes plantas han sido enviadas por clientes externos para ser vendidas. Haz clic en <span className="font-bold text-yellow-300">"Subir Planta al Mural"</span> para cargar automáticamente toda la información en tu panel de publicación, verificarla y hacerla oficial para todo el público.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {solicitudes.map(sol => (
                <div key={sol.id} className="bg-stone-950/80 border border-stone-850 rounded-2xl p-4 flex gap-4 shadow-lg transition-all hover:bg-stone-950">
                  <div className="w-24 h-24 bg-stone-900 rounded-xl overflow-hidden flex-shrink-0 border border-stone-800 relative">
                    {sol.image ? (
                      <img src={sol.image} alt={sol.plantType} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-stone-600 text-xs text-center p-1 font-bold">Sin foto</div>
                    )}
                    <div className="absolute bottom-1 right-1 bg-yellow-500 text-stone-950 font-extrabold text-[9px] px-1.5 py-0.5 rounded shadow-md">
                      {sol.price}
                    </div>
                  </div>
                  <div className="flex-grow flex flex-col justify-between min-w-0">
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <span className="text-xs font-extrabold text-white truncate">{sol.plantType}</span>
                        <span className="text-[9px] text-stone-550 font-mono">{sol.date}</span>
                      </div>
                      <p className="text-stone-400 text-[11px] leading-tight line-clamp-2 mb-1 font-medium italic">
                        &quot; {sol.description} &quot;
                      </p>
                      <div className="text-[10px] text-stone-500 leading-none space-y-1">
                        <p><span className="font-extrabold text-stone-400">Cliente:</span> {sol.clientName}</p>
                        <p><span className="font-extrabold text-stone-400">Contacto:</span> <span className="text-green-400 underline font-mono select-all">{sol.clientContact}</span></p>
                      </div>
                    </div>

                    <div className="flex gap-2 mt-3 pt-2 border-t border-stone-900">
                      <button 
                        onClick={() => handleApproveSolicitud(sol)}
                        className="bg-yellow-600 hover:bg-yellow-500 text-stone-950 font-extrabold text-[10px] py-1.5 px-3 rounded-lg transition-colors cursor-pointer flex-grow text-center"
                      >
                        ✅ Subir Planta al Mural
                      </button>
                      <button 
                        onClick={() => handleDismissSolicitud(sol.id)}
                        className="bg-stone-900 hover:bg-stone-850 hover:text-red-400 border border-stone-800 text-stone-500 font-bold text-[10px] py-1.5 px-2 rounded-lg transition-colors cursor-pointer"
                        title="Descartar solicitud"
                      >
                        Descartar
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ==============================================
             CLIENT SUBMISSIONS INBOX PREVIEW (EMPTY IN BOX)
           ============================================== */}
        {isVipMode && solicitudes.length === 0 && (
          <div className="mb-10 bg-stone-905 border border-stone-850 rounded-2xl p-4 text-center text-stone-500 text-xs">
            📬 No hay solicitudes de venta pendientes por parte de clientes en este momento.
          </div>
        )}

        {/* ==============================================
             MAIN ACTION SELECTORS & INTERACTIVE BUTTONS
           ============================================== */}
        <div className="bg-stone-900 p-4 rounded-3xl border border-stone-850 shadow-2xl flex flex-col sm:flex-row items-center gap-4 mb-10 justify-between">
          <div className="relative w-full sm:max-w-md">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-stone-500">
              <SearchIcon className="h-5 w-5" />
            </span>
            <input 
              type="text" 
              placeholder="Buscar planta, precio, características..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-stone-950 border border-stone-800 hover:border-stone-750 focus:border-green-600 focus:outline-none rounded-2xl py-3 pl-11 pr-4 text-sm font-semibold text-white placeholder-stone-500 transition-colors shadow-inner"
            />
          </div>

          <div className="w-full sm:w-auto flex flex-wrap gap-2 justify-end">
            {/* VIP action only */}
            {isVipMode ? (
              <button 
                onClick={() => {
                  setShowAddForm(!showAddForm);
                  setShowSendForm(false);
                }}
                className={`w-full sm:w-auto font-extrabold text-xs py-3 px-5 rounded-2xl cursor-pointer transition-all duration-300 shadow-md ${
                  showAddForm 
                    ? 'bg-red-950 text-red-300 border border-red-800' 
                    : 'bg-green-700 hover:bg-green-600 text-white hover:shadow-green-950/20 active:scale-97'
                }`}
              >
                {showAddForm ? '❌ Cancelar Registro' : '➕ Publicar Nueva Planta'}
              </button>
            ) : (
              // Guest/Visitor action button to sell and send requests
              <button 
                onClick={() => {
                  setShowSendForm(!showSendForm);
                  setShowAddForm(false);
                }}
                className={`w-full sm:w-auto font-extrabold text-xs py-3 px-5 rounded-2xl cursor-pointer transition-all duration-300 shadow-md ${
                  showSendForm 
                    ? 'bg-red-950 text-red-300 border border-red-800' 
                    : 'bg-green-700 hover:bg-green-600 text-white hover:shadow-green-950/20 active:scale-97 flex items-center justify-center gap-1.5'
                }`}
              >
                <span>📩</span>
                <span>¿Quieres vender tu planta? Envíanos una foto</span>
              </button>
            )}
          </div>
        </div>

        {/* ==============================================
             CLIENT SEND/SALE REQUEST FORM (PUBLIC)
           ============================================== */}
        {showSendForm && !isVipMode && (
          <div className="bg-stone-900 border-2 border-green-800/60 rounded-3xl p-6 md:p-8 mb-12 shadow-2xl relative">
            <div className="absolute top-4 right-4">
              <button 
                onClick={() => setShowSendForm(false)} 
                className="text-stone-400 hover:text-white p-2 hover:bg-stone-800 rounded-full cursor-pointer transition-colors"
              >
                <XIcon className="h-5 w-5" />
              </button>
            </div>

            <div className="flex items-center gap-3 mb-6">
              <div className="h-10 w-10 bg-green-950 border border-green-800 text-green-400 rounded-xl flex items-center justify-center text-lg shadow">
                🌱
              </div>
              <div>
                <h2 className="text-xl font-extrabold text-white">Vende tu Planta o Solicita Publicar</h2>
                <p className="text-stone-400 text-xs">Completa los datos de tu espécimen para que el equipo lo suba al Mural Oficial.</p>
              </div>
            </div>

            <form onSubmit={handleClientSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Name */}
                <div className="space-y-2">
                  <label className="text-xs uppercase tracking-wider font-extrabold text-stone-300 block">Tu Nombre Completo</label>
                  <input 
                    type="text" 
                    placeholder="Ej: Sofía Martínez"
                    value={clientForm.clientName}
                    onChange={(e) => setClientForm(prev => ({ ...prev, clientName: e.target.value }))}
                    className="w-full bg-stone-950 border border-stone-850 hover:border-stone-750 focus:border-green-600 focus:outline-none rounded-xl p-3.5 text-sm text-stone-100 font-semibold transition-colors"
                  />
                </div>

                {/* Contact */}
                <div className="space-y-2">
                  <label className="text-xs uppercase tracking-wider font-extrabold text-stone-300 block">Medio de Contacto (WhatsApp, Celular, Correo)</label>
                  <input 
                    type="text" 
                    placeholder="Ej: +52 55 1234 5678 o sofia@email.com"
                    value={clientForm.clientContact}
                    onChange={(e) => setClientForm(prev => ({ ...prev, clientContact: e.target.value }))}
                    className="w-full bg-stone-950 border border-stone-850 hover:border-stone-750 focus:border-green-600 focus:outline-none rounded-xl p-3.5 text-sm text-stone-100 font-semibold transition-colors"
                  />
                </div>

                {/* Plant name */}
                <div className="space-y-2">
                  <label className="text-xs uppercase tracking-wider font-extrabold text-stone-300 block">Nombre / Especie de Planta</label>
                  <input 
                    type="text" 
                    placeholder="Ej: Orquídea Phalaenopsis Blanca"
                    value={clientForm.plantType}
                    onChange={(e) => setClientForm(prev => ({ ...prev, plantType: e.target.value }))}
                    className="w-full bg-stone-950 border border-stone-850 hover:border-stone-750 focus:border-green-600 focus:outline-none rounded-xl p-3.5 text-sm text-stone-100 font-semibold transition-colors"
                  />
                </div>

                {/* Suggested price */}
                <div className="space-y-2">
                  <label className="text-xs uppercase tracking-wider font-extrabold text-stone-300 block">Precio Deseado o de Venta ($ MXN)</label>
                  <input 
                    type="text" 
                    placeholder="Ej: $250 o Tratado Directo"
                    value={clientForm.price}
                    onChange={(e) => setClientForm(prev => ({ ...prev, price: e.target.value }))}
                    className="w-full bg-stone-950 border border-stone-850 hover:border-stone-750 focus:border-green-600 focus:outline-none rounded-xl p-3.5 text-sm text-stone-100 font-semibold transition-colors"
                  />
                </div>

              </div>

              {/* Plant description */}
              <div className="space-y-2">
                <label className="text-xs uppercase tracking-wider font-extrabold text-stone-300 block">Historia, Salud o Cuidados de Planta</label>
                <textarea 
                  rows={3}
                  placeholder="Dinos el estado de la planta, edad, cuántos riegos recibe y si ha usado nuestra emulsión..."
                  value={clientForm.description}
                  onChange={(e) => setClientForm(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full bg-stone-950 border border-stone-850 hover:border-stone-750 focus:border-green-600 focus:outline-none rounded-xl p-3.5 text-sm text-stone-100 font-semibold transition-colors resize-none"
                />
              </div>

              {/* Plant photo handler */}
              <div className="space-y-3 bg-stone-950/60 p-4 rounded-2xl border border-stone-850">
                <span className="text-xs uppercase tracking-wider font-extrabold text-stone-300 block">Fotografía Real de tu Planta (Evidencia)</span>
                
                <div className="flex flex-wrap items-center gap-4">
                  <button 
                    type="button"
                    onClick={() => clientFileInputRef.current?.click()}
                    disabled={isCompresingClient}
                    className="bg-stone-900 border border-stone-800 hover:border-stone-700 hover:text-white text-stone-300 rounded-xl px-4 py-2.5 text-xs font-bold transition-all cursor-pointer inline-flex items-center gap-2"
                  >
                    <CameraIcon className="h-4.5 w-4.5 text-stone-400" />
                    <span>Elegir Foto</span>
                  </button>
                  <input 
                    type="file" 
                    ref={clientFileInputRef}
                    accept="image/*"
                    onChange={handleClientFileChange}
                    className="hidden" 
                  />

                  {clientForm.image && (
                    <div className="relative h-16 w-16 bg-stone-900 rounded-lg overflow-hidden border border-stone-800">
                      <img src={clientForm.image} alt="Vista previa del cliente" className="h-full w-full object-cover" />
                      <button 
                        type="button"
                        onClick={() => {
                          setClientForm(prev => ({ ...prev, image: '' }));
                          setClientImageText('');
                        }}
                        className="absolute top-0.5 right-0.5 p-0.5 bg-black/70 hover:bg-black rounded-full text-white"
                        title="Borrar imagen"
                      >
                        <XIcon className="h-3 w-3" />
                      </button>
                    </div>
                  )}

                  {clientImageText && <span className="text-[11px] font-mono font-bold text-stone-400">{clientImageText}</span>}
                </div>
              </div>

              {clientFormError && <p className="text-xs text-red-400 font-bold">⚠️ {clientFormError}</p>}

              <button 
                type="submit"
                disabled={isUploading || isCompresingClient}
                className="w-full bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 text-white font-extrabold py-4 px-6 rounded-2xl cursor-pointer shadow-lg hover:shadow-green-950/25 active:scale-98 transition-all disabled:opacity-50 flex items-center justify-center gap-2 text-sm"
              >
                {isUploading ? (
                  <>
                    <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Enviando información al Mural...</span>
                  </>
                ) : (
                  <>
                    <span>Enviar Solicitud de Venta de Planta</span>
                  </>
                )}
              </button>

            </form>
          </div>
        )}

        {/* ==============================================
             VIP ADM PUBLISH FORM (CREATOR/DEVELOPER CODES)
           ============================================== */}
        {showAddForm && isVipMode && (
          <div className="bg-stone-900 border border-yellow-600/30 rounded-3xl p-6 md:p-8 mb-12 shadow-2xl relative">
            
            <div className="absolute top-4 right-4">
              <button 
                onClick={() => setShowAddForm(false)} 
                className="text-stone-400 hover:text-white p-2 hover:bg-stone-800 rounded-full cursor-pointer transition-colors"
                title="Cerrar Formulario"
              >
                <XIcon className="h-5 w-5" />
              </button>
            </div>

            <div className="flex items-center gap-3 mb-6">
              <div className="h-10 w-10 bg-yellow-950 border border-yellow-850/60 text-yellow-400 rounded-xl flex items-center justify-center text-lg shadow-inner">
                🌿
              </div>
              <div>
                <h2 className="text-xl font-extrabold text-white">
                  Formulario VIP: Publicar en el Mural
                </h2>
                <p className="text-stone-400 text-xs">Añade fichas de tus plantas con fotografía, producto y precio sugerido.</p>
              </div>
            </div>

            <form onSubmit={handleVipSubmit} className="space-y-6">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                {/* Author Name */}
                <div className="space-y-2">
                  <label className="text-xs uppercase tracking-wider font-extrabold text-stone-300 block">Nombre del Autor o Propietario</label>
                  <input 
                    type="text" 
                    placeholder="Ej: Vivero Suelo Urbano o Carlos G."
                    value={formData.author}
                    onChange={(e) => setFormData(prev => ({ ...prev, author: e.target.value }))}
                    className="w-full bg-stone-950 border border-stone-850 hover:border-stone-750 focus:border-green-600 focus:outline-none rounded-xl p-3.5 text-sm text-stone-100 font-semibold transition-colors"
                  />
                </div>

                {/* Brand product associated */}
                <div className="space-y-2">
                  <label className="text-xs uppercase tracking-wider font-extrabold text-stone-300 block">Nutriente Suelo Urbano Usado</label>
                  <select 
                    value={formData.product}
                    onChange={(e) => setFormData(prev => ({ ...prev, product: e.target.value }))}
                    className="w-full bg-stone-950 border border-stone-850 focus:border-green-600 focus:outline-none rounded-xl p-3.5 text-sm text-stone-100 font-bold transition-colors"
                  >
                    <option value="Suelo Urbano Premium">Suelo Urbano Premium (Emulsión Pura)</option>
                    <option value="Suelo Urbano Humus / Orgánico">Suelo Urbano Humus / Orgánico</option>
                    <option value="Suelo Urbano Pack Orquídeas">Suelo Urbano Pack Orquídeas</option>
                    <option value="Nutrición Orgánica Integral">Nutrición Orgánica Integral</option>
                  </select>
                </div>

                {/* Plant type */}
                <div className="space-y-2">
                  <label className="text-xs uppercase tracking-wider font-extrabold text-stone-300 block">Tipo de Planta u Orquídea</label>
                  <input 
                    type="text" 
                    placeholder="Ej: Anturio Rojo, Orquídea Vanda"
                    value={formData.plantType}
                    onChange={(e) => setFormData(prev => ({ ...prev, plantType: e.target.value }))}
                    className="w-full bg-stone-950 border border-stone-850 hover:border-stone-750 focus:border-green-600 focus:outline-none rounded-xl p-3.5 text-sm text-stone-100 font-semibold transition-colors"
                  />
                </div>

                {/* Headline result */}
                <div className="space-y-2">
                  <label className="text-xs uppercase tracking-wider font-extrabold text-stone-300 block">Título de Publicación</label>
                  <input 
                    type="text" 
                    placeholder="Ej: Floración exuberante y hojas gigantes"
                    value={formData.headline}
                    onChange={(e) => setFormData(prev => ({ ...prev, headline: e.target.value }))}
                    className="w-full bg-stone-950 border border-stone-850 hover:border-stone-750 focus:border-green-600 focus:outline-none rounded-xl p-3.5 text-sm text-stone-100 font-semibold transition-colors"
                  />
                </div>

                {/* NEW: Price tag field */}
                <div className="space-y-2">
                  <label className="text-xs uppercase tracking-wider font-extrabold text-stone-300 block">
                    Precio de Venta / Costo sugerido ($ MXN)
                  </label>
                  <input 
                    type="text" 
                    placeholder="Ej: $180 MXN, $450, o Deja vacío si no está en venta"
                    value={formData.price}
                    onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                    className="w-full bg-stone-950 border border-stone-850 hover:border-stone-750 focus:border-green-600 focus:outline-none rounded-xl p-3.5 text-sm text-stone-100 font-semibold transition-colors"
                  />
                </div>

                {/* Days of applying */}
                <div className="space-y-2">
                  <label className="text-xs uppercase tracking-wider font-extrabold text-stone-300 block">Días de uso de alimento / Edad aproximada</label>
                  <input 
                    type="number" 
                    min={1}
                    value={formData.daysUsed}
                    onChange={(e) => setFormData(prev => ({ ...prev, daysUsed: Number(e.target.value) }))}
                    className="w-full bg-stone-950 border border-stone-850 focus:border-green-600 focus:outline-none rounded-xl p-3.5 text-sm text-stone-100 font-mono font-bold transition-colors"
                  />
                </div>

              </div>

              {/* Star Rating picker */}
              <div className="space-y-2">
                <span className="text-xs uppercase tracking-wider font-extrabold text-stone-300 block">Calificación de Salud u Hoja</span>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map(num => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, rating: num }))}
                      className={`h-11 w-11 rounded-xl border font-bold text-sm cursor-pointer transition-colors ${
                        num <= formData.rating 
                          ? 'bg-green-950 border-green-800 text-yellow-400' 
                          : 'bg-stone-950 border-stone-850 text-stone-600'
                      }`}
                    >
                      🌱
                    </button>
                  ))}
                  <span className="ml-2 flex items-center font-bold text-xs text-stone-400">({formData.rating} hojitas)</span>
                </div>
              </div>

              {/* Content description */}
              <div className="space-y-2">
                <label className="text-xs uppercase tracking-wider font-extrabold text-stone-300 block">Descripción Completa u Observaciones</label>
                <textarea 
                  rows={4}
                  placeholder="Relata el crecimiento foliar, el brillo de hojas o estimación de venta..."
                  value={formData.content}
                  onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                  className="w-full bg-stone-950 border border-stone-850 hover:border-stone-750 focus:border-green-600 focus:outline-none rounded-xl p-3.5 text-sm text-stone-100 font-semibold transition-colors resize-none"
                />
              </div>

              {/* Before and After toggle switcher */}
              <div className="space-y-4">
                <label className="flex items-center gap-3 cursor-pointer select-none">
                  <input 
                    type="checkbox" 
                    checked={formData.hasBeforeAfter}
                    onChange={(e) => setFormData(prev => ({ ...prev, hasBeforeAfter: e.target.checked }))}
                    className="h-5 w-5 rounded bg-stone-950 border border-stone-800 text-green-600 focus:ring-0 cursor-pointer"
                  />
                  <span className="text-xs uppercase tracking-widest font-extrabold text-stone-200">
                    Incluir comparación visual (Foto de Antes y Después)
                  </span>
                </label>

                {/* Double file fields wrapper */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Image 1: Main After */}
                  <div className="bg-stone-950/40 p-4 border border-stone-850 rounded-2xl space-y-2.5">
                    <span className="text-[11px] uppercase tracking-wide font-extrabold text-stone-400 block">Fotografía Final (Después)</span>
                    <div className="flex gap-3 items-center">
                      <button 
                        type="button" 
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isCompresing}
                        className="bg-stone-900 border border-stone-800 text-stone-300 px-3 py-2 rounded-lg text-xs font-bold hover:bg-stone-850 transition-colors cursor-pointer inline-flex items-center gap-1.5"
                      >
                        <CameraIcon className="h-4 w-4" />
                        <span>Elegir Foto</span>
                      </button>
                      <input 
                        type="file" 
                        ref={fileInputRef} 
                        accept="image/*" 
                        onChange={(e) => handleFileChange(e, false)} 
                        className="hidden" 
                      />
                      {formData.image && (
                        <div className="relative h-12 w-12 rounded overflow-hidden border border-stone-800">
                          <img src={formData.image} alt="Prev" className="h-full w-full object-cover" />
                        </div>
                      )}
                      {imageAfterText && <span className="text-[10px] text-stone-450 font-mono italic">{imageAfterText}</span>}
                    </div>
                  </div>

                  {/* Image 2: Optional Before */}
                  {formData.hasBeforeAfter && (
                    <div className="bg-stone-950/40 p-4 border border-stone-850 rounded-2xl space-y-2.5 animate-fade-in-main">
                      <span className="text-[11px] uppercase tracking-wide font-extrabold text-stone-400 block">Fotografía Inicial (Antes de Emulsión)</span>
                      <div className="flex gap-3 items-center">
                        <button 
                          type="button" 
                          onClick={() => beforeFileInputRef.current?.click()}
                          disabled={isCompresingBefore}
                          className="bg-stone-900 border border-stone-800 text-stone-300 px-3 py-2 rounded-lg text-xs font-bold hover:bg-stone-850 transition-colors cursor-pointer inline-flex items-center gap-1.5"
                        >
                          <CameraIcon className="h-4 w-4" />
                          <span>Elegir Foto</span>
                        </button>
                        <input 
                          type="file" 
                          ref={beforeFileInputRef} 
                          accept="image/*" 
                          onChange={(e) => handleFileChange(e, true)} 
                          className="hidden" 
                        />
                        {formData.beforeImage && (
                          <div className="relative h-12 w-12 rounded overflow-hidden border border-stone-800">
                            <img src={formData.beforeImage} alt="Prev Before" className="h-full w-full object-cover" />
                          </div>
                        )}
                        {imageBeforeText && <span className="text-[10px] text-stone-450 font-mono italic">{imageBeforeText}</span>}
                      </div>
                    </div>
                  )}
                </div>

              </div>

              {formError && <p className="text-xs text-red-400 font-bold">⚠️ {formError}</p>}

              <button 
                type="submit"
                disabled={isUploading || isCompresing || isCompresingBefore}
                className="w-full bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 text-white font-extrabold py-4 px-6 rounded-2xl cursor-pointer shadow-lg hover:shadow-green-950/20 active:scale-98 transition-all disabled:opacity-50 flex items-center justify-center gap-2 text-sm"
              >
                {isUploading ? (
                  <>
                    <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Publicando planta en el Mural...</span>
                  </>
                ) : (
                  <>
                    <span>Confirmar y Publicar en Mural Suelo Urbano</span>
                  </>
                )}
              </button>

            </form>
          </div>
        )}

        {/* ==============================================
             SUCCESS PUBLISH DISPATCH ALERT
           ============================================== */}
        {formSuccess && (
          <div className="mb-8 p-4 bg-lime-950/50 border border-lime-800/60 rounded-2xl text-lime-400 text-center text-xs font-extrabold animate-pulse">
            ✨ ¡Tu planta ha sido publicada en el Mural con éxito! Todos los clientes ya pueden observarla.
          </div>
        )}

        {/* ==============================================
             CATALOG CARDS VIEW GRID (PUBLIC EXHIBITION)
           ============================================== */}
        {filteredPosts.length === 0 ? (
          <div className="bg-stone-900 border border-stone-850 rounded-3xl p-12 text-center text-stone-500 shadow-xl max-w-2xl mx-auto">
            <span className="text-3xl">🌿</span>
            <h3 className="text-white font-extrabold text-sm uppercase tracking-wider mt-4">Mural Vacío o Sin Resultados</h3>
            <p className="text-xs text-stone-450 mt-1.5 leading-relaxed">
              No hay plantas publicadas que coincidan con &quot;{searchQuery}&quot;. Intente con otra palabra clave o solicita publicar tu planta para empezar. Let&apos;s build community!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPosts.map(post => {
              const hasLiked = !!likedPosts[post.id];
              const isCompareMode = post.hasBeforeAfter && post.beforeImage;
              const activeToggleView = visibleHistoryToggle[post.id] || 'after';

              return (
                <article 
                  key={post.id} 
                  id={`muro-post-${post.id}`}
                  className="bg-stone-905 border border-stone-850/80 rounded-3xl overflow-hidden shadow-xl hover:shadow-2xl hover:border-stone-800 transition-all duration-300 flex flex-col relative group"
                >
                  
                  {/* UPPER PRICE BADGE & PRODUCT TYPE ACCENTS */}
                  {post.price && (
                    <div className="absolute top-3 left-3 z-30 bg-emerald-500 hover:bg-emerald-400 text-stone-950 font-black text-xs px-3.5 py-1.5 rounded-full shadow-lg border border-emerald-300/30 uppercase tracking-wide flex items-center gap-1">
                      <span>🏷️</span>
                      <span>{post.price}</span>
                    </div>
                  )}

                  {/* Interactive photo container with optional before/after switch toggle slider */}
                  <div className="relative h-64 bg-stone-950 overflow-hidden select-none">
                    {isCompareMode ? (
                      <>
                        <img 
                          src={activeToggleView === 'after' ? post.image : post.beforeImage} 
                          alt={post.plantType} 
                          className="h-full w-full object-cover transition-opacity duration-300"
                        />
                        
                        {/* Upper left visual active tag */}
                        <span className="absolute top-3 right-3 z-20 bg-black/75 backdrop-blur-md text-[10px] font-black uppercase tracking-wider text-green-300 px-2.5 py-1 rounded-md border border-stone-800">
                          {activeToggleView === 'after' ? 'Con Emulsión (Después)' : 'Antes'}
                        </span>

                        {/* Slide switcher triggers button bar at bottom */}
                        <div className="absolute inset-x-0 bottom-3 z-20 flex justify-center gap-2">
                          <div className="bg-black/80 backdrop-blur-md p-1.5 rounded-full border border-stone-800 flex gap-1 shadow-lg">
                            <button
                              onClick={() => setVisibleHistoryToggle(prev => ({ ...prev, [post.id]: 'before' }))}
                              className={`text-[9px] uppercase tracking-widest font-black px-3 py-1 rounded-full cursor-pointer transition-all ${
                                activeToggleView === 'before' 
                                  ? 'bg-yellow-505 text-stone-950 font-black bg-yellow-400' 
                                  : 'text-stone-400 hover:text-white'
                              }`}
                            >
                              Antes
                            </button>
                            <button
                              onClick={() => setVisibleHistoryToggle(prev => ({ ...prev, [post.id]: 'after' }))}
                              className={`text-[9px] uppercase tracking-widest font-black px-3 py-1 rounded-full cursor-pointer transition-all ${
                                activeToggleView === 'after' 
                                  ? 'bg-green-505 text-stone-950 font-black bg-green-400' 
                                  : 'text-stone-400 hover:text-white'
                              }`}
                            >
                              Después
                            </button>
                          </div>
                        </div>

                      </>
                    ) : (
                      <img 
                        src={post.image} 
                        alt={post.plantType} 
                        className="h-full w-full object-cover group-hover:scale-102 transition-transform duration-500"
                        referrerPolicy="no-referrer"
                      />
                    )}
                  </div>

                  {/* Card Content parameters */}
                  <div className="p-6 flex-grow flex flex-col justify-between">
                    <div>
                      
                      {/* Product line label and calendar */}
                      <div className="flex items-center justify-between text-[10px] font-extrabold text-stone-450 tracking-wider uppercase mb-2">
                        <span className="text-green-400 flex items-center gap-1">
                          <SproutIcon className="h-3.5 w-3.5" />
                          <span>{post.product}</span>
                        </span>
                        <span className="flex items-center gap-1">
                          <CalendarIcon className="h-3.5 w-3.5 text-stone-500" />
                          <span>{post.daysUsed} Días / Edad</span>
                        </span>
                      </div>

                      {/* Plant title / headline */}
                      <h3 className="text-lg font-extrabold text-white leading-snug tracking-tight mb-2 line-clamp-1">
                        {post.headline}
                      </h3>

                      {/* Plant description story */}
                      <p className="text-stone-400 text-xs leading-relaxed line-clamp-4 font-medium mb-4">
                        {post.content}
                      </p>

                    </div>

                    {/* Lower Author Row & interactive Likes feedback button */}
                    <div className="pt-4 border-t border-stone-850 flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-stone-800 border border-stone-750 flex items-center justify-center text-xs text-green-400 font-extrabold select-none">
                          {post.author.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-xs font-bold text-white leading-none truncate max-w-[124px]">{post.author}</p>
                          <p className="text-[10px] text-stone-500 font-semibold tracking-wide uppercase mt-0.5">
                            🌟 {post.plantType}
                          </p>
                        </div>
                      </div>

                      {/* Interactive Inspiring/Love heart feedback */}
                      <button 
                        onClick={() => handleLike(post.id)}
                        className={`flex items-center gap-2 px-3.5 py-2 rounded-xl border font-bold text-xs transition-all duration-200 cursor-pointer active:scale-95 ${
                          hasLiked 
                            ? 'bg-green-950 border-green-850 text-green-300 shadow-[0_0_12px_rgba(22,101,52,0.2)]' 
                            : 'bg-stone-900 border-stone-800/80 text-stone-400 hover:text-white hover:border-stone-700'
                        }`}
                        title={hasLiked ? "Ya no me gusta" : "¡Me gusta este espécimen!"}
                      >
                        <HeartIcon className={`h-4.5 w-4.5 transition-transform duration-300 ${hasLiked ? 'fill-green-400 text-green-400 scale-125' : 'text-current'}`} />
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
