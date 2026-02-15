import React, { useState, useEffect, useCallback } from 'react';
import { PremiumMenuProps, MenuItem } from '../compositions/PremiumMenu';
import { saveMenuConfig, uploadMenuItemImage } from '../services/firebaseService';
import { refineCopy } from '../services/aiService';
import { triggerRenderWorkflow } from '../services/githubActionsService';
import { auth } from '../services/firebaseConfig';
import {
    Palette,
    Sparkles,
    Save,
    Download,
    Plus,
    Trash2,
    RotateCcw,
    Loader2,
    ImageIcon,
    Camera,
    Utensils,
    Cloud,
    CheckCircle2,
    AlertCircle,
    User,
    Lock
} from 'lucide-react';

interface MenuControlsProps {
    props: PremiumMenuProps;
    setProps: (props: PremiumMenuProps) => void;
}

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
    const [name, setName] = useState(item.name);
    const [description, setDescription] = useState(item.description);
    const [price, setPrice] = useState(item.price);
    const [hasChanges, setHasChanges] = useState(false);

    useEffect(() => {
        setName(item.name);
        setDescription(item.description);
        setPrice(item.price);
        setHasChanges(false);
    }, [item.name, item.description, item.price]);

    const handleLocalChange = (field: string, value: string) => {
        if (field === 'name') setName(value);
        if (field === 'description') setDescription(value);
        if (field === 'price') setPrice(value);
        setHasChanges(true);
    };

    const commitChanges = () => {
        onUpdate(index, { name, description, price });
        setHasChanges(false);
    };

    return (
        <div className={`p-4 space-y-3 border rounded-2xl group transition-all duration-300 ${hasChanges ? 'border-amber-500/60 bg-amber-500/5 shadow-xl shadow-amber-500/10 scale-[1.01]' : 'border-white/5 bg-white/5'}`}>
            <div className="flex gap-4">
                <div className="relative group/img w-24 h-24 rounded-xl overflow-hidden bg-black/40 border border-white/10 shrink-0 flex items-center justify-center">
                    {item.image ? (
                        <img
                            src={item.image}
                            alt={name}
                            className={`w-full h-full object-cover transition-opacity ${item.image.startsWith('blob:') ? 'opacity-40 animate-pulse' : 'opacity-80 group-hover/img:opacity-100'}`}
                        />
                    ) : (
                        <ImageIcon size={28} className="text-white/10" />
                    )}
                    <label className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 group-hover/img:opacity-100 transition-all cursor-pointer">
                        <Camera size={24} className="text-white" />
                        <input type="file" className="hidden" accept="image/*" onChange={(e) => onUploadImage(index, e)} disabled={isGenerating} />
                    </label>
                    {item.image?.startsWith('blob:') && (
                        <div className="absolute top-2 right-2 p-1 bg-amber-500 rounded-full shadow-lg animate-bounce" title="¡Súbela a la nube!">
                            <Cloud size={12} className="text-black" />
                        </div>
                    )}
                    {(item as any).uploadError && (
                        <div className="absolute inset-0 flex items-center justify-center bg-red-500/20 backdrop-blur-[2px]">
                            <AlertCircle size={24} className="text-red-500 animate-pulse" />
                        </div>
                    )}
                </div>

                <div className="flex-1 space-y-2">
                    <div className="flex items-center justify-between gap-2">
                        <input
                            value={name}
                            onChange={(e) => handleLocalChange('name', e.target.value)}
                            className="w-full text-base font-black text-white bg-transparent border-none focus:ring-0 p-0 placeholder:text-white/10"
                            placeholder="Nombre del platillo"
                        />
                        <button onClick={() => onRemove(index)} className="p-2 transition-all opacity-0 group-hover:opacity-100 text-white/20 hover:text-red-500">
                            <Trash2 size={16} />
                        </button>
                    </div>
                    <textarea
                        value={description}
                        onChange={(e) => handleLocalChange('description', e.target.value)}
                        className="w-full text-xs text-white/40 bg-transparent border-none focus:ring-0 p-0 resize-none h-10 leading-snug placeholder:text-white/5"
                        placeholder="Descripción corta..."
                    />
                    <div className="flex items-center justify-between pt-2">
                        <div className="flex items-center gap-1.5 px-3 py-1 bg-white/5 rounded-lg border border-white/5">
                            <span className="text-xs font-bold text-amber-500">$</span>
                            <input
                                value={price.replace('$', '')}
                                onChange={(e) => handleLocalChange('price', `$${e.target.value}`)}
                                className="w-16 text-sm font-black bg-transparent border-none focus:ring-0 p-0 text-white"
                                placeholder="0.00"
                            />
                        </div>

                        {hasChanges ? (
                            <button
                                onClick={commitChanges}
                                className="px-4 py-1.5 bg-amber-500 hover:bg-amber-400 text-black text-xs font-black rounded-xl flex items-center gap-1.5 transition-all shadow-lg shadow-amber-500/20 animate-pulse"
                            >
                                <Save size={14} /> GUARDAR
                            </button>
                        ) : (
                            <div className="flex items-center gap-1.5 text-[10px] font-bold text-green-500/60 uppercase tracking-widest">
                                <CheckCircle2 size={12} /> LISTO
                            </div>
                        )}
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
    const [userId, setUserId] = useState<string>('los-cuates');

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged((user) => {
            if (user) {
                console.log('👤 Usuario activo:', user.uid);
                setUserId(user.uid);
            }
        });
        return () => unsubscribe();
    }, []);

    const saveMenu = async () => {
        setIsGenerating(true);
        setCurrentAction('Sincronizando...');
        try {
            localStorage.setItem('menu_studio_config', JSON.stringify(props));
            await saveMenuConfig(userId, props);
            setIsSaved(true);
            setTimeout(() => setIsSaved(false), 2000);
        } catch (error) {
            console.error('Error:', error);
            alert('Error al sincronizar con la nube. Asegúrate de que las reglas de Firebase estén abiertas.');
        } finally {
            setIsGenerating(false);
            setCurrentAction(null);
        }
    };

    const addItem = () => {
        const newItem: MenuItem = { image: '', name: 'Nuevo Item', description: 'Deliciosa descripción', price: '$0.00' };
        setProps({ ...props, menuItems: [...props.menuItems, newItem] });
    };

    const updateItem = useCallback((index: number, updates: Partial<MenuItem>) => {
        setProps({ ...props, menuItems: props.menuItems.map((item, i) => i === index ? { ...item, ...updates } : item) });
    }, [props, setProps]);

    const handleUploadImage = async (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const localUrl = URL.createObjectURL(file);
        updateItem(index, { image: localUrl, uploadError: false } as any);

        setIsGenerating(true);
        setCurrentAction('Subiendo Imagen...');
        try {
            const url = await uploadMenuItemImage(userId, file, file.name);
            updateItem(index, { image: url, uploadError: false } as any);
        } catch (error) {
            updateItem(index, { uploadError: true } as any);
            alert('Error de subida. Verifica las reglas de Storage en Firebase.');
        } finally {
            setIsGenerating(false);
            setCurrentAction(null);
        }
    };

    // BLINDAJE 2: Validación de Render y Bloqueo de UI
    const handleExport = async () => {
        // 1. Verificar imágenes locales (blob)
        const hasBlobs = props.menuItems.some(item => item.image?.startsWith('blob:')) ||
            props.logoUri?.startsWith('blob:');

        if (hasBlobs) {
            alert('❌ REGLA DE SEGURIDAD: Tienes imágenes locales (Nube Naranja parpadeando).\n\nDebes subirlas a la nube antes de exportar el video profesional.');
            return;
        }

        // 2. Prevenir múltiples clicks
        if (isRendering) return;

        setIsRendering(true);
        try {
            const result = await triggerRenderWorkflow({
                menuConfig: {
                    ...props,
                    // Convertir segundos a frames (30fps)
                    sceneDuration: Math.round((props.sceneDuration || 4) * 30)
                },
                filename: `menu-${Date.now()}.mp4`
            });
            window.open(result.htmlUrl, '_blank');
            alert('🚀 ¡PRODUCCIÓN INICIADA!\nSe ha abierto la pestaña de GitHub Actions. El video estará listo en 60 segundos.');
        } catch (error) {
            console.error('Render error:', error);
            alert('Error al contactar con el servidor de renderizado.');
        } finally {
            setIsRendering(false);
        }
    };

    return (
        <div className="flex flex-col h-full bg-[#0a0a0a] text-white">
            {/* STICKY HEADER AI STYLE */}
            <div className="p-6 bg-black/60 backdrop-blur-2xl border-b border-white/5 sticky top-0 z-30 space-y-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-amber-500 rounded-2xl flex items-center justify-center shadow-lg shadow-amber-500/20">
                            <Sparkles size={20} className="text-black" />
                        </div>
                        <div>
                            <h2 className="text-sm font-black uppercase tracking-tighter">Panel de Control</h2>
                            <div className="flex items-center gap-1.5 text-[9px] text-white/30 font-bold">
                                <User size={10} /> {userId === 'los-cuates' ? 'Modo Invitado' : `ID: ${userId.slice(0, 8)}...`}
                            </div>
                        </div>
                    </div>
                    <button
                        onClick={saveMenu}
                        disabled={isGenerating}
                        className={`px-6 py-2.5 rounded-2xl font-black text-xs transition-all flex items-center gap-2 border ${isSaved ? 'bg-green-500 text-black border-green-400 scale-105' : 'bg-amber-500 text-black border-amber-400 hover:scale-105 active:scale-95 shadow-xl shadow-amber-500/20'} disabled:opacity-50`}
                    >
                        {isSaved ? <CheckCircle2 size={16} /> : <Save size={16} />}
                        {isSaved ? 'SINCRONIZADO' : 'SYNC CLOUD'}
                    </button>
                </div>

                <div className="flex gap-2">
                    <input
                        value={props.restaurantName}
                        onChange={(e) => setProps({ ...props, restaurantName: e.target.value })}
                        className="flex-1 bg-white/5 border border-white/10 rounded-2xl py-3 px-5 text-sm font-bold focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500/50 outline-none transition-all"
                        placeholder="Nombre Restaurante"
                    />
                    <button
                        onClick={addItem}
                        className="w-12 h-12 bg-white/5 hover:bg-white/10 border border-white/10 text-amber-500 rounded-2xl flex items-center justify-center transition-all active:scale-90"
                    >
                        <Plus size={28} />
                    </button>
                </div>
            </div>

            {/* CONTENT LIST */}
            <div className="p-6 space-y-10 overflow-y-auto pb-40 scrollbar-hide">
                <div className="space-y-4">
                    <div className="flex items-center justify-between text-white/20">
                        <h3 className="text-[10px] font-black uppercase tracking-[0.3em]">Menu Manager</h3>
                        <span className="text-[10px] bg-white/5 px-2 py-1 rounded-md">{props.menuItems.length} PLATILLOS</span>
                    </div>
                    <div className="space-y-4">
                        {props.menuItems.length === 0 ? (
                            <div className="py-20 flex flex-col items-center justify-center text-white/10 border-2 border-dashed border-white/5 rounded-[40px] space-y-4">
                                <Utensils size={48} />
                                <p className="text-xs font-black uppercase tracking-widest">El menú está vacío</p>
                                <button onClick={addItem} className="text-[10px] text-amber-500 font-bold border border-amber-500/20 px-4 py-2 rounded-full hover:bg-amber-500/5 transition-all">AÑADIR MI PRIMER PLATILLO</button>
                            </div>
                        ) : (
                            props.menuItems.map((item, index) => (
                                <MenuItemCard
                                    key={`${index}-${item.name}`}
                                    item={item}
                                    index={index}
                                    onUpdate={updateItem}
                                    onRemove={(i) => setProps({ ...props, menuItems: props.menuItems.filter((_, idx) => idx !== i) })}
                                    onUploadImage={handleUploadImage}
                                    isGenerating={isGenerating}
                                />
                            ))
                        )}
                    </div>
                </div>

                {/* VISUAL & AI TOOLS */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-white/5 rounded-3xl border border-white/5 space-y-3">
                        <div className="flex items-center gap-2 text-white/30">
                            <Palette size={14} />
                            <span className="text-[9px] font-black uppercase">Color</span>
                        </div>
                        <input type="color" value={props.accentColor} onChange={(e) => setProps({ ...props, accentColor: e.target.value })} className="w-full h-12 rounded-xl bg-black/40 border-none cursor-pointer" />
                    </div>
                    <div className="p-4 bg-white/5 rounded-3xl border border-white/5 space-y-3">
                        <div className="flex items-center gap-2 text-white/30">
                            <RotateCcw size={14} />
                            <span className="text-[9px] font-black uppercase">Segs</span>
                        </div>
                        <input type="number" value={props.sceneDuration} step="0.5" onChange={(e) => setProps({ ...props, sceneDuration: parseFloat(e.target.value) })} className="w-full h-12 px-4 rounded-xl bg-black/40 border-none text-white font-bold" />
                    </div>
                </div>

                <button
                    onClick={async () => {
                        setIsGenerating(true);
                        setCurrentAction('AI Refinando...');
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
                    }}
                    disabled={isGenerating || props.menuItems.length === 0}
                    className="w-full py-4 bg-gradient-to-br from-amber-500/10 to-transparent border border-amber-500/20 rounded-3xl text-amber-500 font-black text-[11px] uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-amber-500/10 transition-all disabled:opacity-30 disabled:grayscale"
                >
                    <Sparkles size={16} /> Magia AI en Textos
                </button>

                {/* EXPORT SECTION */}
                <div className="pt-10 border-t border-white/5 space-y-6">
                    <div className="flex items-center gap-2 text-white/10 uppercase font-black text-[10px] tracking-[0.4em]">Producción Profesional</div>
                    <button
                        onClick={handleExport}
                        disabled={isRendering || props.menuItems.length === 0}
                        className={`w-full py-6 rounded-[32px] font-black text-lg transition-all flex items-center justify-center gap-4 shadow-2xl ${isRendering ? 'bg-white/10 text-white/20' : 'bg-white text-black hover:scale-[1.02] active:scale-95 shadow-white/5'}`}
                    >
                        {isRendering ? <Loader2 size={24} className="animate-spin" /> : isRendering ? <Lock size={24} /> : <Download size={24} />}
                        {isRendering ? 'EN COLA DE PROD...' : 'EXPORTAR VIDEO'}
                    </button>
                    <div className="grid grid-cols-2 gap-4">
                        <button onClick={() => window.location.reload()} className="py-3 bg-white/5 rounded-2xl text-[10px] font-bold text-white/30 uppercase border border-white/5 hover:bg-white/10">Refrescar App</button>
                        <button onClick={() => { localStorage.removeItem('menu_studio_config'); window.location.reload(); }} className="py-3 bg-red-500/10 rounded-2xl text-[10px] font-bold text-red-500/40 uppercase border border-red-500/10 hover:bg-red-500/20">Reset Data</button>
                    </div>
                </div>
            </div>

            {/* FLOATING STATUS */}
            {isGenerating && (
                <div className="fixed bottom-10 left-[420px] px-8 py-4 bg-amber-500 text-black rounded-full shadow-[0_0_50px_rgba(245,158,11,0.4)] flex items-center gap-4 font-black text-sm uppercase tracking-widest animate-in slide-in-from-bottom-10 z-[100]">
                    <Loader2 className="animate-spin" size={20} />
                    {currentAction}
                </div>
            )}
        </div>
    );
};
