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
    // Local state for snappy typing without parent re-renders
    const [localName, setLocalName] = useState(item.name);
    const [localDesc, setLocalDesc] = useState(item.description);
    const [localPrice, setLocalPrice] = useState(item.price);

    // Sync local state if external props change (e.g. AI refinement)
    useEffect(() => {
        setLocalName(item.name);
        setLocalDesc(item.description);
        setLocalPrice(item.price);
    }, [item.name, item.description, item.price]);

    const handleBlur = (field: keyof MenuItem, value: string) => {
        if (item[field] !== value) {
            onUpdate(index, { [field]: value });
        }
    };

    return (
        <div className="p-4 space-y-3 border border-white/5 bg-white/5 rounded-2xl group hover:border-white/10 transition-all">
            <div className="flex gap-4">
                {/* Image Placeholder/Preview */}
                <div className="relative group/img w-20 h-20 rounded-xl overflow-hidden bg-black/40 border border-white/5 shrink-0 flex items-center justify-center">
                    {item.image ? (
                        <img
                            src={item.image}
                            alt={localName}
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
                        <div className="absolute top-1 right-1" title="Pendiente de subir a la nube">
                            <Cloud size={10} className="text-amber-500" />
                        </div>
                    )}
                </div>

                <div className="flex-1 space-y-2">
                    <div className="flex items-center justify-between gap-2">
                        <input
                            value={localName}
                            onChange={(e) => setLocalName(e.target.value)}
                            onBlur={(e) => handleBlur('name', e.target.value)}
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
                        value={localDesc}
                        onChange={(e) => setLocalDesc(e.target.value)}
                        onBlur={(e) => handleBlur('description', e.target.value)}
                        className="w-full text-[11px] text-white/50 bg-transparent border-none focus:ring-0 p-0 resize-none h-12 leading-relaxed placeholder:text-white/10"
                        placeholder="Descripción"
                    />
                    <div className="flex items-center justify-between pt-1">
                        <div className="flex items-center gap-1 text-amber-500/80">
                            <span className="text-xs font-bold">$</span>
                            <input
                                value={localPrice.replace('$', '')}
                                onChange={(e) => setLocalPrice(`$${e.target.value}`)}
                                onBlur={(e) => handleBlur('price', `$${e.target.value.replace('$', '')}`)}
                                className="w-16 text-xs font-bold bg-transparent border-none focus:ring-0 p-0 placeholder:text-amber-500/20"
                                placeholder="0.00"
                            />
                        </div>
                        {/* Indicador de que el cambio es local */}
                        <div className="flex items-center gap-1 text-[9px] uppercase tracking-tighter text-white/20">
                            <Save size={10} /> Sync
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
        setCurrentAction('Guardando...');
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
            image: '', // Vacío para forzar que suban una
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
            const url = await uploadMenuItemImage(DEFAULT_USER_ID, file, file.name);
            updateItem(index, { image: url });
        } catch (error: any) {
            console.error('Error uploading:', error);
            const errorMessage = error?.message || 'Error desconocido';
            alert(`⚠️ Error de subida a la nube: ${errorMessage}\n\nLa imagen es local; no funcionará en el render Pro.`);
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
            alert('❌ ERROR: Tienes imágenes locales (blob).\n\nRe-sube las imágenes que tienen el icono de nube naranja antes de exportar.');
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

    const handleCopyProps = () => {
        navigator.clipboard.writeText(JSON.stringify(props, null, 2));
        alert('📋 Copiado.');
    };

    useEffect(() => {
        (window as any).__menuExport = handleExportMP4;
    }, [handleExportMP4]);

    return (
        <div className="p-6 space-y-8 pb-32">
            {/* Visual Style */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-[#D4AF37]">
                        <Palette size={18} />
                        <h2 className="font-bold text-xs uppercase tracking-widest">Estilo Visual</h2>
                    </div>
                    <div className="flex items-center gap-2">
                        <button onClick={resetToDefaults} className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/40 transition-all">
                            <RotateCcw size={14} />
                        </button>
                        <button
                            onClick={saveMenu}
                            disabled={isGenerating}
                            className={`px-4 py-1.5 rounded-lg transition-all flex items-center gap-2 text-xs font-bold ${isSaved ? 'bg-green-500/20 text-green-400 border border-green-500/50' : 'bg-[#D4AF37]/10 hover:bg-[#D4AF37]/20 text-[#D4AF37] border border-[#D4AF37]/20 shadow-lg shadow-amber-500/5'}`}
                        >
                            {isSaved ? <CheckCircle2 size={14} /> : <Save size={14} />}
                            {isSaved ? '¡Sincronizado!' : 'Guardar Todo'}
                        </button>
                    </div>
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
                            {props.logoUri ? <img src={props.logoUri} className="w-full h-full object-contain p-1" /> : <ImageIcon size={20} className="text-white/20" />}
                        </div>
                        <label className="flex-1 cursor-pointer">
                            <div className="py-2 px-3 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 transition-all text-[11px] font-bold text-center border border-amber-500/20 text-amber-500">
                                {props.logoUri ? 'Cambiar Logo' : 'Subir Logo PNG'}
                            </div>
                            <input type="file" className="hidden" accept="image/*" onChange={handleLogoUpload} disabled={isGenerating} />
                        </label>
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-wider text-white/40 font-bold">Música de Fondo</label>
                    <select value={props.backgroundMusic || ''} onChange={(e) => setProps({ ...props, backgroundMusic: e.target.value })} className="w-full h-10 px-4 rounded-xl bg-black/20 border border-white/5 text-white text-xs font-medium focus:ring-1 focus:ring-amber-500/50 appearance-none cursor-pointer hover:bg-black/30 transition-all">
                        <option value="">Sin música</option>
                        <option value="jazz-lounge">Jazz Lounge</option>
                        <option value="modern-tech">Modern Tech</option>
                        <option value="latin-fest">Latin Fest</option>
                        <option value="ambient-chill">Ambient Chill</option>
                    </select>
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl bg-amber-500/5 border border-amber-500/10 hover:bg-amber-500/10 transition-all group cursor-pointer" onClick={() => setProps({ ...props, isSeamlessLoop: !props.isSeamlessLoop })}>
                    <div className="flex items-center gap-2">
                        <RotateCcw size={14} className={`transition-transform duration-500 ${props.isSeamlessLoop ? 'rotate-180 text-amber-400' : 'text-amber-500/40'}`} />
                        <span className="text-[11px] font-bold text-amber-500/90">Loop Seamless</span>
                    </div>
                    <div className={`w-10 h-5 rounded-full relative transition-all duration-300 ${props.isSeamlessLoop ? 'bg-amber-500' : 'bg-white/10'}`}>
                        <div className={`absolute top-1 w-3 h-3 rounded-full bg-white transition-all duration-300 ${props.isSeamlessLoop ? 'left-6' : 'left-1'}`} />
                    </div>
                </div>
            </div>

            {/* AI Director */}
            <div className="p-4 border rounded-2xl bg-gradient-to-br from-amber-500/10 to-transparent border-amber-500/20">
                <div className="flex items-center gap-2 mb-4 text-amber-400">
                    <Sparkles size={18} />
                    <h2 className="font-bold text-xs uppercase tracking-widest">Director AI</h2>
                </div>
                <div className="grid grid-cols-1 gap-3">
                    <button onClick={handleRefineAllTexts} disabled={isGenerating} className="flex items-center justify-center gap-2 py-3 text-xs font-bold text-white transition-all border border-white/10 rounded-xl bg-white/5 hover:bg-white/10">
                        {isGenerating && currentAction?.includes('Refinando') ? <Loader2 className="w-4 h-4 animate-spin" /> : <Type size={16} />}
                        Optimizar Todos los Textos
                    </button>
                    <div className="grid grid-cols-2 gap-3">
                        <button onClick={() => handleApplyTheme('GALA')} disabled={isGenerating} className="flex items-center justify-center gap-2 py-3 text-xs font-bold text-white transition-all border border-white/10 rounded-xl bg-white/5 hover:bg-white/10">
                            <Moon size={16} className="text-purple-400" /> Gala
                        </button>
                        <button onClick={() => handleApplyTheme('FEST')} disabled={isGenerating} className="flex items-center justify-center gap-2 py-3 text-xs font-bold text-white transition-all border border-white/10 rounded-xl bg-white/5 hover:bg-white/10">
                            <PartyPopper size={16} className="text-pink-400" /> Fest
                        </button>
                    </div>
                </div>
            </div>

            {/* Dishes */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-white/70">
                        <Utensils size={18} />
                        <h2 className="font-bold text-xs uppercase tracking-widest">Listado de Platillos</h2>
                    </div>
                    <button onClick={addItem} className="p-2 rounded-xl bg-amber-500 text-black hover:bg-amber-400 transition-all shadow-lg shadow-amber-500/20 active:scale-95">
                        <Plus size={20} />
                    </button>
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

            {/* Cloud Export */}
            <div className="pt-6 border-t border-white/10 space-y-4">
                <div className="flex items-center gap-2 text-[#D4AF37]">
                    <Cloud size={18} />
                    <h2 className="font-bold text-xs uppercase tracking-widest">Render Cloud (Producción)</h2>
                </div>
                <div className="bg-white/5 rounded-2xl p-4 border border-white/10 space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                        <button onClick={handleCopyProps} className="flex flex-col items-center justify-center gap-2 p-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-all group">
                            <Copy size={20} className="text-amber-500" />
                            <span className="text-[10px] font-bold text-white/70 uppercase">Copiar JSON</span>
                        </button>
                        <a href="https://github.com/calvin316byBoxesMedia360/BoxesMedia360-Logo-Animation/actions/workflows/render.yml" target="_blank" rel="noopener noreferrer" className="flex flex-col items-center justify-center gap-2 p-3 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 rounded-xl transition-all group text-center">
                            <ExternalLink size={20} className="text-amber-500" />
                            <span className="text-[10px] font-bold text-amber-500 uppercase">Ver Progreso</span>
                        </a>
                    </div>
                    <button onClick={handleExportMP4} disabled={isRendering} className={`w-full py-4 rounded-xl flex items-center justify-center gap-3 font-bold text-sm transition-all ${isRendering ? 'bg-amber-500/10 text-amber-500' : 'bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-black shadow-xl shadow-amber-500/10 active:scale-[0.98]'}`}>
                        {isRendering ? <Loader2 className="animate-spin" /> : <Download />}
                        <span>{isRendering ? `Procesando ${renderProgress}%...` : 'Exportar Video Final (MP4)'}</span>
                    </button>
                </div>
            </div>

            {/* Status Floating Bar */}
            {isGenerating && (
                <div className="fixed bottom-6 left-[400px] right-8 z-[100] flex justify-center">
                    <div className="bg-amber-500 text-black px-6 py-3 rounded-full shadow-2xl flex items-center gap-3 font-bold animate-bounce">
                        <Loader2 className="animate-spin" size={18} />
                        <span className="text-xs uppercase tracking-widest">{currentAction}</span>
                    </div>
                </div>
            )}
        </div>
    );
};
