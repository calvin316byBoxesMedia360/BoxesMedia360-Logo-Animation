import React, { useState, useEffect, useCallback } from 'react';
import { PremiumMenuProps, MenuItem } from '../compositions/PremiumMenu';
import { saveMenuConfig, uploadMenuItemImage } from '../services/firebaseService';
import { refineCopy, applyTheme } from '../services/aiService';
import { triggerRenderWorkflow } from '../services/githubActionsService';
import {
    Palette,
    Sparkles,
    Save,
    Download,
    Plus,
    Trash2,
    RotateCcw,
    Loader2,
    Type,
    Image as ImageIcon,
    Camera,
    Moon,
    PartyPopper,
    Utensils,
    Cloud,
    ExternalLink,
    Settings,
    CheckCircle2,
    Copy
} from 'lucide-react';

interface MenuControlsProps {
    props: PremiumMenuProps;
    setProps: (props: PremiumMenuProps) => void;
}

const DEFAULT_USER_ID = 'los-cuates';

// --- SUB-COMPONENTE PARA CADA PLATILLO ---
interface MenuItemCardProps {
    item: MenuItem;
    index: number;
    onUpdate: (index: number, updates: Partial<MenuItem>) => void;
    onRemove: (index: number) => void;
    onUploadImage: (index: number, e: React.ChangeEvent<HTMLInputElement>) => void;
    isGenerating: boolean;
}

const MenuItemCard: React.FC<MenuItemCardProps> = ({ item, index, onUpdate, onRemove, onUploadImage, isGenerating }) => {
    // Controlled inputs directly linked to parent state for real-time video update
    return (
        <div className="p-4 space-y-3 border border-white/5 bg-white/5 rounded-2xl group hover:border-white/10 transition-all">
            <div className="flex gap-4">
                {/* Image Section */}
                <div className="relative group/img w-20 h-20 rounded-xl overflow-hidden bg-black/40 border border-white/5 shrink-0 flex items-center justify-center">
                    {item.image ? (
                        <img
                            src={item.image}
                            alt={item.name}
                            className={`w-full h-full object-cover transition-opacity ${item.image.startsWith('blob:') ? 'opacity-40 animate-pulse' : 'opacity-60 group-hover/img:opacity-100'}`}
                        />
                    ) : (
                        <ImageIcon size={24} className="text-white/20" />
                    )}
                    <label className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 group-hover/img:opacity-100 transition-all cursor-pointer">
                        <Camera size={20} className="text-white" />
                        <input
                            type="file"
                            className="hidden"
                            accept="image/*"
                            onChange={(e) => onUploadImage(index, e)}
                            disabled={isGenerating}
                        />
                    </label>
                    {item.image?.startsWith('blob:') && (
                        <div className="absolute top-1 right-1" title="Error: No subido a la nube">
                            <Cloud size={12} className="text-red-500 animate-pulse" />
                        </div>
                    )}
                </div>

                {/* Content Section */}
                <div className="flex-1 space-y-2">
                    <div className="flex items-center justify-between gap-2">
                        <input
                            value={item.name}
                            onChange={(e) => onUpdate(index, { name: e.target.value })}
                            className="w-full text-sm font-bold text-white bg-transparent border-none focus:ring-0 p-0 placeholder:text-white/20"
                            placeholder="Nombre del platillo"
                        />
                        <button
                            onClick={() => onRemove(index)}
                            className="p-1.5 transition-all opacity-0 rounded-lg text-white/20 hover:text-red-500 hover:bg-red-500/10 group-hover:opacity-100"
                        >
                            <Trash2 size={14} />
                        </button>
                    </div>
                    <textarea
                        value={item.description}
                        onChange={(e) => onUpdate(index, { description: e.target.value })}
                        className="w-full text-[11px] text-white/50 bg-transparent border-none focus:ring-0 p-0 resize-none h-12 leading-relaxed placeholder:text-white/10"
                        placeholder="Descripción"
                    />
                    <div className="flex items-center justify-between pt-1">
                        <div className="flex items-center gap-1 text-amber-500/80">
                            <span className="text-xs font-bold">$</span>
                            <input
                                value={item.price.replace('$', '')}
                                onChange={(e) => onUpdate(index, { price: `$${e.target.value}` })}
                                className="w-16 text-xs font-bold bg-transparent border-none focus:ring-0 p-0 placeholder:text-amber-500/20"
                                placeholder="0.00"
                            />
                        </div>

                        <div className="flex items-center gap-1 text-[9px] uppercase tracking-tighter text-white/20">
                            <Save size={10} /> Live-Preview
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export const MenuControls: React.FC<MenuControlsProps> = ({ props, setProps }) => {
    const [isGenerating, setIsGenerating] = useState(false);
    const [isSaved, setIsSaved] = useState(false);
    const [currentAction, setCurrentAction] = useState<string | null>(null);
    const [isRendering, setIsRendering] = useState(false);
    const [renderProgress, setRenderProgress] = useState(0);

    // --- MANEJO DE ESTADO GLOBAL ---

    const saveMenu = async () => {
        setIsGenerating(true);
        setCurrentAction('Sincronizando...');
        try {
            // Guardar en LocalStorage permanentemente
            localStorage.setItem('menu_studio_config', JSON.stringify(props));

            // Intentar persistir en Firebase
            try {
                await saveMenuConfig(DEFAULT_USER_ID, props);
                console.log('✅ Sincronizado con la nube');
            } catch (firebaseError) {
                console.warn('⚠️ Error Firestore, persistencia local activa');
            }

            setIsSaved(true);
            setTimeout(() => setIsSaved(false), 2000);
        } catch (error) {
            console.error('Error al guardar:', error);
            alert('Error al guardar. Tu navegador mantiene los cambios, pero verifica tu internet.');
        } finally {
            setIsGenerating(false);
            setCurrentAction(null);
        }
    };

    const resetToDefaults = () => {
        if (confirm('¿Deseas borrar TODO y empezar de nuevo?')) {
            localStorage.removeItem('menu_studio_config');
            window.location.reload();
        }
    };

    // --- MANEJO DE PLATILLOS ---

    const updateItem = useCallback((index: number, updates: Partial<MenuItem>) => {
        setProps({
            ...props,
            menuItems: props.menuItems.map((item, i) => i === index ? { ...item, ...updates } : item)
        });
    }, [props, setProps]);

    const addItem = () => {
        const newItem: MenuItem = {
            image: '',
            name: 'Nuevo Platillo',
            description: 'Descripción del delicioso platillo',
            price: '$0.00',
        };
        setProps({
            ...props,
            menuItems: [...props.menuItems, newItem]
        });
    };

    const removeItem = (index: number) => {
        if (props.menuItems.length <= 1) {
            alert('El menú debe tener al menos un platillo.');
            return;
        }
        const newItems = props.menuItems.filter((_, i) => i !== index);
        setProps({ ...props, menuItems: newItems });
    };

    const handleUploadImage = async (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.size > 5 * 1024 * 1024) {
            alert('Imagen muy grande (Máx 5MB)');
            return;
        }

        // Mostrar preview local inmediato
        const localUrl = URL.createObjectURL(file);
        updateItem(index, { image: localUrl });

        setIsGenerating(true);
        setCurrentAction('Subiendo a la nube...');

        try {
            // Asegurar auth antes de subir
            const { auth } = await import('../services/firebaseConfig');
            const { signInAnonymously } = await import('firebase/auth');

            try {
                if (!auth.currentUser) {
                    console.log('🔄 Autenticando para subida...');
                    await signInAnonymously(auth);
                }
            } catch (authErr: any) {
                if (authErr.code === 'auth/admin-restricted-operation') {
                    throw new Error('EL PROYECTO TIENE EL ACCESO ANÓNIMO DESACTIVADO.\n\nPor favor, ve a Firebase Console -> Authentication -> Sign-in method -> Habilita "Anónimo".');
                }
                throw authErr;
            }

            const url = await uploadMenuItemImage(DEFAULT_USER_ID, file, file.name);
            updateItem(index, { image: url });
        } catch (error: any) {
            console.error('Error uploading:', error);
            alert(`❌ ERROR DE NUBE: ${error.message}`);
        } finally {
            setIsGenerating(false);
            setCurrentAction(null);
        }
    };

    const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsGenerating(true);
        setCurrentAction('Subiendo logo...');
        try {
            const url = await uploadMenuItemImage(DEFAULT_USER_ID, file, 'logo.png');
            setProps({ ...props, logoUri: url });
        } catch (error) {
            alert('Fallo al subir logo. Intenta de nuevo.');
        } finally {
            setIsGenerating(false);
            setCurrentAction(null);
        }
    };

    // --- IA Y RENDER ---

    const handleRefineAllTexts = async () => {
        setIsGenerating(true);
        setCurrentAction('IA Refinando copia...');
        try {
            const newItems = await Promise.all(props.menuItems.map(async (item) => ({
                ...item,
                name: await refineCopy(item.name),
                description: await refineCopy(item.description || '')
            })));
            setProps({ ...props, menuItems: newItems });
        } finally {
            setIsGenerating(false);
            setCurrentAction(null);
        }
    };

    const handleApplyTheme = async (theme: string) => {
        setIsGenerating(true);
        setCurrentAction(`Aplicando estilo ${theme}...`);
        try {
            const result = await applyTheme(theme);
            setProps({
                ...props,
                accentColor: result.accentColor,
                sceneDuration: result.sceneDuration
            });
        } finally {
            setIsGenerating(false);
            setCurrentAction(null);
        }
    };

    const handleExportMP4 = async () => {
        // Validar integridad de la nube
        const hasBlobs = props.menuItems.some(item => item.image?.startsWith('blob:')) ||
            props.logoUri?.startsWith('blob:');

        if (hasBlobs) {
            alert('❌ ERROR: Tienes imágenes locales (blob).\n\nRe-sube las imágenes que tienen el icono de nube roja antes de exportar.');
            return;
        }

        setIsRendering(true);
        setRenderProgress(0);
        try {
            const result = await triggerRenderWorkflow({
                menuConfig: {
                    ...props,
                    sceneDuration: (props.sceneDuration || 4) * 30
                },
                filename: `${props.restaurantName || 'menu'}-${Date.now()}.mp4`
            });

            window.open(result.htmlUrl, '_blank');
            try { await navigator.clipboard.writeText(result.htmlUrl); } catch (e) { }

            alert('🚀 ¡Renderizado iniciado!\nEl link está en tu portapapeles.');
            setRenderProgress(100);
        } catch (error) {
            alert('Error al exportar. Revisa tu conexión.');
        } finally {
            setIsRendering(false);
            setRenderProgress(0);
            setCurrentAction(null);
        }
    };

    useEffect(() => {
        (window as any).__menuExport = handleExportMP4;
    }, [handleExportMP4]);

    return (
        <div className="p-0 flex flex-col h-full bg-[#121212]">
            {/* Header Sticky */}
            <div className="p-6 border-b border-white/5 bg-black/40 backdrop-blur-md sticky top-0 z-20">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-2">
                        <Utensils className="text-amber-500" size={18} />
                        <h2 className="text-sm font-bold uppercase tracking-wider">Editor Pro</h2>
                    </div>
                    <button
                        onClick={saveMenu}
                        disabled={isGenerating}
                        className={`px-5 py-2 rounded-xl transition-all flex items-center gap-2 text-xs font-bold border ${isSaved ? 'bg-green-500 text-black border-green-400' : 'bg-amber-500 text-black border-amber-400 shadow-xl shadow-amber-500/20 hover:scale-105 active:scale-95'}`}
                    >
                        {isSaved ? <CheckCircle2 size={16} /> : <Save size={16} />}
                        {isSaved ? 'Sincronizado' : 'Sincronizar Todo'}
                    </button>
                </div>

                <div className="flex items-center gap-2">
                    <div className="flex-1 relative group">
                        <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                            <Utensils size={14} className="text-white/20 group-focus-within:text-amber-500 transition-colors" />
                        </div>
                        <input
                            value={props.restaurantName}
                            onChange={(e) => setProps({ ...props, restaurantName: e.target.value })}
                            className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pl-9 pr-4 text-sm focus:ring-1 focus:ring-amber-500/50 focus:border-amber-500/50 transition-all placeholder:text-white/10 text-white"
                            placeholder="Nombre del Restaurante"
                        />
                    </div>
                    <button
                        onClick={addItem}
                        className="w-11 h-11 bg-amber-500 hover:bg-amber-400 text-black rounded-xl flex items-center justify-center transition-all shadow-lg shadow-amber-500/20 active:scale-90"
                        title="Añadir nuevo platillo"
                    >
                        <Plus size={24} strokeWidth={3} />
                    </button>
                </div>
            </div>

            <div className="p-6 space-y-8 overflow-y-auto pb-32">
                {/* Visual Style */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-white/50">
                            <Palette size={18} />
                            <h2 className="font-bold text-xs uppercase tracking-widest">Estilo Visual</h2>
                        </div>
                        <button onClick={resetToDefaults} className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/20 transition-all" title="Reiniciar todo">
                            <RotateCcw size={14} />
                        </button>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-[10px] uppercase tracking-wider text-white/40 font-bold">Color Acento</label>
                            <input type="color" value={props.accentColor} onChange={(e) => setProps({ ...props, accentColor: e.target.value })} className="w-full h-10 transition-all cursor-pointer rounded-xl bg-white/5 border-none" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] uppercase tracking-wider text-white/40 font-bold">Transición (Seg)</label>
                            <input type="number" value={props.sceneDuration} step="0.5" min="2" max="10" onChange={(e) => setProps({ ...props, sceneDuration: parseFloat(e.target.value) })} className="w-full h-10 px-4 transition-all rounded-xl bg-white/5 border-none text-white font-medium" />
                        </div>
                    </div>
                </div>

                {/* Brand Settings */}
                <div className="p-4 bg-white/5 border border-white/5 rounded-2xl space-y-4">
                    <div className="flex items-center gap-2 mb-2 text-white/50">
                        <Settings size={18} />
                        <h2 className="font-bold text-xs uppercase tracking-widest">Marca & Video</h2>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] uppercase tracking-wider text-white/40 font-bold">Logo del Restaurante</label>
                        <div className="flex items-center gap-3 p-3 rounded-xl bg-black/20 border border-white/5">
                            <div className="w-12 h-12 rounded-lg bg-black/40 flex items-center justify-center overflow-hidden shrink-0 border border-white/10">
                                {props.logoUri ? <img src={props.logoUri} className="w-full h-full object-contain p-1" alt="Logo" /> : <ImageIcon size={20} className="text-white/20" />}
                            </div>
                            <label className="flex-1 cursor-pointer">
                                <div className="py-2 px-3 rounded-lg bg-white/5 hover:bg-white/10 transition-all text-[11px] font-bold text-center border border-white/10 text-white/60">
                                    {props.logoUri ? 'Cambiar Logo' : 'Subir Logo PNG'}
                                </div>
                                <input type="file" className="hidden" accept="image/*" onChange={handleLogoUpload} disabled={isGenerating} />
                            </label>
                        </div>
                    </div>
                </div>

                {/* AI Director */}
                <div className="p-4 border rounded-2xl bg-gradient-to-br from-amber-500/10 to-transparent border-amber-500/20">
                    <div className="flex items-center gap-2 mb-4 text-amber-500">
                        <Sparkles size={18} />
                        <h2 className="font-bold text-xs uppercase tracking-widest">Director AI</h2>
                    </div>
                    <div className="grid grid-cols-1 gap-3">
                        <button onClick={handleRefineAllTexts} disabled={isGenerating} className="flex items-center justify-center gap-3 py-3 text-xs font-bold text-white transition-all border border-white/10 rounded-xl bg-white/5 hover:bg-white/10">
                            {isGenerating && currentAction?.includes('Refinando') ? <Loader2 className="w-4 h-4 animate-spin" /> : <Type size={16} />}
                            Refinar Textos (Copywriting)
                        </button>
                    </div>
                </div>

                {/* Dishes List */}
                <div className="space-y-4">
                    <div className="text-white/50 flex项目 items-center gap-2">
                        <Utensils size={18} />
                        <h2 className="font-bold text-xs uppercase tracking-widest">Platillos ({props.menuItems.length})</h2>
                    </div>
                    <div className="space-y-3">
                        {props.menuItems.map((item, index) => (
                            <MenuItemCard
                                key={index}
                                item={item}
                                index={index}
                                onUpdate={updateItem}
                                onRemove={removeItem}
                                onUploadImage={handleUploadImage}
                                isGenerating={isGenerating}
                            />
                        ))}
                    </div>
                </div>

                {/* Cloud Rendering */}
                <div className="pt-6 border-t border-white/10 space-y-4">
                    <div className="flex items-center justify-between text-white/30">
                        <div className="flex items-center gap-2">
                            <Cloud size={16} />
                            <h2 className="text-[10px] font-bold uppercase tracking-[0.2em]">Render Cloud (PRO)</h2>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <button
                            onClick={() => {
                                navigator.clipboard.writeText(JSON.stringify(props, null, 2));
                                alert('JSON copiado');
                            }}
                            className="p-3 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-all flex flex-col items-center gap-2 group"
                        >
                            <Copy size={18} className="text-white/20 group-hover:text-amber-500 transition-colors" />
                            <span className="text-[9px] font-bold text-white/40 uppercase">JSON</span>
                        </button>
                        <button
                            onClick={() => window.open('https://github.com/calvin316byBoxesMedia360/BoxesMedia360-Logo-Animation/actions', '_blank')}
                            className="p-3 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-all flex flex-col items-center gap-2 group"
                        >
                            <ExternalLink size={18} className="text-white/20 group-hover:text-amber-500 transition-colors" />
                            <span className="text-[9px] font-bold text-white/40 uppercase">Progreso</span>
                        </button>
                    </div>

                    <button
                        onClick={handleExportMP4}
                        disabled={isRendering || isGenerating}
                        className="w-full py-4 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-bold shadow-lg shadow-amber-500/20 transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:grayscale"
                    >
                        {isRendering ? (
                            <>
                                <Loader2 size={18} className="animate-spin" />
                                <span className="text-sm">PROCESANDO ({renderProgress}%)</span>
                            </>
                        ) : (
                            <>
                                <Download size={20} />
                                <span className="text-base">Exportar Video MP4</span>
                            </>
                        )}
                    </button>
                </div>
            </div>

            {/* Status Floating Bar */}
            {isGenerating && (
                <div className="fixed bottom-6 left-[420px] right-8 z-[100] flex justify-center pointer-events-none">
                    <div className="bg-amber-500 text-black px-6 py-3 rounded-full shadow-2xl flex items-center gap-3 font-bold animate-in slide-in-from-bottom-5">
                        <Loader2 className="animate-spin" size={18} />
                        <span className="text-xs uppercase tracking-widest">{currentAction}</span>
                    </div>
                </div>
            )}
        </div>
    );
};
