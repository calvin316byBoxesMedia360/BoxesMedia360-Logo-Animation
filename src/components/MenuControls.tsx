import React, { useState, useEffect } from 'react';
import { PremiumMenuProps, MenuItem } from '../compositions/PremiumMenu';
import { saveMenuConfig, uploadMenuItemImage } from '../services/firebaseService';
import { refineCopy, applyTheme, optimizeVisibility } from '../services/aiService';
import { triggerRenderWorkflow } from '../services/githubActionsService';
import {
    Palette,
    Sparkles,
    Save,
    Download,
    Plus,
    Trash2,
    Upload,
    RotateCcw,
    Wand2,
    Eye,
    Zap,
    Copy,
    CheckCircle,
    CheckCircle2,
    Loader,
    Loader2,
    Film,
    Music,
    Clock,
    Maximize2,
    Type,
    Image as ImageIcon,
    Camera,
    Moon,
    PartyPopper,
    Sun,
    Utensils,
    Cloud,
    ExternalLink,
    Settings,
    Music2,
    Volume2
} from 'lucide-react';

interface MenuControlsProps {
    props: PremiumMenuProps;
    setProps: (props: PremiumMenuProps) => void;
    onExport?: () => void;
}

const DEFAULT_USER_ID = 'los-cuates';

// --- SUB-COMPONENTE PARA CADA PLATILLO ---
interface MenuItemCardProps {
    item: MenuItem;
    onUpdate: (updates: Partial<MenuItem>) => void;
    onRemove: () => void;
    onUploadImage: (e: React.ChangeEvent<HTMLInputElement>) => void;
    isGenerating: boolean;
}

const MenuItemCard: React.FC<MenuItemCardProps> = ({ item, onUpdate, onRemove, onUploadImage, isGenerating }) => {
    const [localItem, setLocalItem] = useState(item);
    const [hasChanges, setHasChanges] = useState(false);

    useEffect(() => {
        setLocalItem(item);
        setHasChanges(false);
    }, [item]);

    const handleChange = (updates: Partial<MenuItem>) => {
        setLocalItem(prev => ({ ...prev, ...updates }));
        setHasChanges(true);
    };

    const handleSave = () => {
        onUpdate(localItem);
        setHasChanges(false);
    };

    return (
        <div className="p-4 space-y-3 border border-white/5 bg-white/5 rounded-2xl group hover:border-white/10 transition-all">
            <div className="flex gap-4">
                <div className="relative group/img w-20 h-20 rounded-xl overflow-hidden bg-black/40 border border-white/5 shrink-0 flex items-center justify-center">
                    {localItem.image ? (
                        <img src={localItem.image} alt={localItem.name} className="w-full h-full object-cover opacity-60 group-hover/img:opacity-100 transition-opacity" />
                    ) : (
                        <ImageIcon size={24} className="text-white/20" />
                    )}
                    <label className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 group-hover/img:opacity-100 transition-all cursor-pointer">
                        <Camera size={20} className="text-white" />
                        <input
                            type="file"
                            className="hidden"
                            accept="image/*"
                            onChange={onUploadImage}
                            disabled={isGenerating}
                        />
                    </label>
                </div>

                <div className="flex-1 space-y-2">
                    <div className="flex items-center justify-between gap-2">
                        <input
                            value={localItem.name}
                            onChange={(e) => handleChange({ name: e.target.value })}
                            className="w-full text-sm font-bold text-white bg-transparent border-none focus:ring-0 p-0"
                            placeholder="Nombre del platillo"
                        />
                        <button
                            onClick={onRemove}
                            className="p-1.5 transition-all opacity-0 rounded-lg text-white/20 hover:text-red-500 hover:bg-red-500/10 group-hover:opacity-100"
                        >
                            <Trash2 size={14} />
                        </button>
                    </div>
                    <textarea
                        value={localItem.description}
                        onChange={(e) => handleChange({ description: e.target.value })}
                        className="w-full text-[11px] text-white/50 bg-transparent border-none focus:ring-0 p-0 resize-none h-12 leading-relaxed"
                        placeholder="Descripción"
                    />
                    <div className="flex items-center justify-between pt-1">
                        <div className="flex items-center gap-1 text-amber-500/80">
                            <span className="text-xs font-bold">$</span>
                            <input
                                value={localItem.price.replace('$', '')}
                                onChange={(e) => handleChange({ price: `$${e.target.value}` })}
                                className="w-16 text-xs font-bold bg-transparent border-none focus:ring-0 p-0"
                                placeholder="0.00"
                            />
                        </div>

                        {hasChanges && (
                            <button
                                onClick={handleSave}
                                className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-500/20 text-green-400 border border-green-500/40 text-[10px] font-bold hover:bg-green-500/30 transition-all animate-in fade-in slide-in-from-right-2"
                            >
                                <Save size={12} />
                                Guardar
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export const MenuControls: React.FC<MenuControlsProps> = ({ props, setProps, onExport }) => {
    const [isGenerating, setIsGenerating] = useState(false);
    const [isSaved, setIsSaved] = useState(false);
    const [currentAction, setCurrentAction] = useState<string | null>(null);
    const [isRendering, setIsRendering] = useState(false);
    const [renderProgress, setRenderProgress] = useState(0);

    const saveMenu = async () => {
        setIsGenerating(true);
        setCurrentAction('Guardando...');
        try {
            localStorage.setItem('menu_studio_config', JSON.stringify(props));
            try {
                await saveMenuConfig(DEFAULT_USER_ID, props);
            } catch (firebaseError) {
                console.warn('⚠️ Firebase no disponible, usando solo LocalStorage');
            }
            setIsSaved(true);
            setTimeout(() => setIsSaved(false), 2000);
        } catch (error) {
            console.error('Error al guardar:', error);
            alert('Error al guardar. Verifica tu conexión.');
        } finally {
            setIsGenerating(false);
            setCurrentAction(null);
        }
    };

    const resetToDefaults = () => {
        if (confirm('¿Estás seguro de que quieres restablecer el menú a los valores por defecto?')) {
            localStorage.removeItem('menu_studio_config');
            window.location.reload();
        }
    };

    const updateItem = (index: number, updates: Partial<MenuItem>) => {
        const newItems = [...props.menuItems];
        newItems[index] = { ...newItems[index], ...updates };
        setProps({ ...props, menuItems: newItems });
    };

    const addItem = () => {
        const newItem: MenuItem = {
            image: 'food1.jpg',
            name: 'Nuevo Platillo',
            description: 'Descripción del delicioso platillo',
            price: '$0.00',
        };
        setProps({ ...props, menuItems: [...props.menuItems, newItem] });
    };

    const removeItem = (index: number) => {
        const newItems = props.menuItems.filter((_, i) => i !== index);
        setProps({ ...props, menuItems: newItems });
    };

    const handleUploadImage = async (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validar tamaño (máx 5MB) para evitar problemas de red
        if (file.size > 5 * 1024 * 1024) {
            alert('La imagen es demasiado grande. Máximo 5MB.');
            return;
        }

        setIsGenerating(true);
        setCurrentAction('Subiendo imagen...');
        try {
            const url = await uploadMenuItemImage(DEFAULT_USER_ID, file, file.name);
            updateItem(index, { image: url });
        } catch (error) {
            console.error('Error uploading image:', error);
            const localUrl = URL.createObjectURL(file);
            updateItem(index, { image: localUrl });
            alert(
                '⚠️ Error al subir a la nube (Permisos Firebase).\n\n' +
                'La imagen se muestra LOCALMENTE, pero no funcionará en el renderizado final.\n' +
                'DALE A "GUARDAR" arriba e intenta subirla de nuevo en un momento.'
            );
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
            console.error('Error subiendo logo:', error);
            alert('Falló la subida del logo.');
        } finally {
            setIsGenerating(false);
            setCurrentAction(null);
        }
    };

    const handleRefineAllTexts = async () => {
        setIsGenerating(true);
        setCurrentAction('Refinando textos...');
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
        setCurrentAction('Aplicando estilo...');
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

    const handleOptimizeLED = async () => {
        setIsGenerating(true);
        setCurrentAction('Ajustando brillo...');
        try {
            const newColor = await optimizeVisibility(props.accentColor || '#D4AF37');
            setProps({ ...props, accentColor: newColor });
        } finally {
            setIsGenerating(false);
            setCurrentAction(null);
        }
    };

    const handleExportMP4 = async () => {
        // 1. Validar que no haya Blobs locales (GitHub no puede verlos)
        const hasBlobs = props.menuItems.some(item => item.image?.startsWith('blob:')) ||
            props.logoUri?.startsWith('blob:');

        if (hasBlobs) {
            alert(
                '❌ ERROR: Hay imágenes locales sin subir a la nube.\n\n' +
                'GitHub Actions no puede acceder a las imágenes de tu computadora.\n' +
                'Por favor, vuelve a subir las imágenes que presentan el error o espera a que termine la sincronización.'
            );
            return;
        }

        setIsRendering(true);
        setRenderProgress(0);

        try {
            setCurrentAction('Preparando renderizado en la nube...');
            setRenderProgress(10);

            const result = await triggerRenderWorkflow({
                menuConfig: {
                    ...props,
                    sceneDuration: (props.sceneDuration || 4) * 30
                },
                filename: `${props.restaurantName || 'menu'}-${Date.now()}.mp4`
            });

            setRenderProgress(30);
            setCurrentAction('Renderizando en GitHub Actions...');

            window.open(result.htmlUrl, '_blank');
            try {
                await navigator.clipboard.writeText(result.htmlUrl);
            } catch (e) { }

            alert(
                `🚀 ¡Renderizado iniciado satisfactoriamente!\n\n` +
                `El link de seguimiento se ha COPIADO a tu portapapeles.\n\n` +
                `El renderizado tardará de 2 a 5 minutos.`
            );
            setRenderProgress(100);
        } catch (error) {
            console.error('Error exportando video:', error);
            alert('Error al exportar. Revisa tu conexión y configuración de GitHub.');
        } finally {
            setIsRendering(false);
            setRenderProgress(0);
            setCurrentAction(null);
        }
    };

    const handleCopyProps = () => {
        const json = JSON.stringify(props, null, 2);
        navigator.clipboard.writeText(json);
        alert('📋 Configuración copiada.');
    };

    useEffect(() => {
        (window as any).__menuExport = handleExportMP4;
    }, [handleExportMP4]);

    return (
        <div className="p-6 space-y-8">
            {/* Visual Style */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-[#D4AF37]">
                        <Palette size={18} />
                        <h2 className="font-bold text-xs uppercase tracking-widest">Estilo Visual</h2>
                    </div>
                    <div className="flex items-center gap-2">
                        <button onClick={resetToDefaults} className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/40 hover:text-red-400 transition-all">
                            <RotateCcw size={14} />
                        </button>
                        <button onClick={saveMenu} disabled={isGenerating} className={`p-1.5 rounded-lg transition-all flex items-center gap-2 text-xs font-bold ${isSaved ? 'bg-green-500/20 text-green-400 border border-green-500/50' : 'bg-white/5 hover:bg-white/10 text-[#D4AF37] border border-white/10'}`}>
                            {isSaved ? <CheckCircle2 size={14} /> : <Save size={14} />}
                            {isSaved ? 'Guardado' : 'Guardar'}
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
                    <label className="text-[10px] uppercase tracking-wider text-white/40 font-bold">Logo</label>
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
                    <label className="text-[10px] uppercase tracking-wider text-white/40 font-bold">Música</label>
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
                        {isGenerating && currentAction?.includes('textos') ? <Loader2 className="w-4 h-4 animate-spin" /> : <Type size={16} />}
                        Optimizar Copy
                    </button>
                    <div className="grid grid-cols-2 gap-3">
                        <button onClick={() => handleApplyTheme('GALA')} disabled={isGenerating} className="flex items-center justify-center gap-2 py-3 text-xs font-bold text-white transition-all border border-white/10 rounded-xl bg-white/5 hover:bg-white/10">
                            <Moon size={16} className="text-purple-400" /> Gala
                        </button>
                        <button onClick={() => handleApplyTheme('FEST')} disabled={isGenerating} className="flex items-center justify-center gap-2 py-3 text-xs font-bold text-white transition-all border border-white/10 rounded-xl bg-white/5 hover:bg-white/10">
                            <PartyPopper size={16} className="text-pink-400" /> Fest
                        </button>
                    </div>
                    <button onClick={handleOptimizeLED} disabled={isGenerating} className="flex items-center justify-center gap-2 py-3 text-xs font-bold text-white transition-all border border-white/10 rounded-xl bg-white/5 hover:bg-white/10">
                        <Sun size={16} className="text-yellow-400" /> Ajustar para LED
                    </button>
                </div>
            </div>

            {/* Dishes */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-white/70">
                        <Utensils size={18} />
                        <h2 className="font-bold text-xs uppercase tracking-widest">Platillos</h2>
                    </div>
                    <button onClick={addItem} className="p-1.5 rounded-lg bg-amber-500/10 text-amber-500 hover:bg-amber-500/20 transition-all">
                        <Plus size={18} />
                    </button>
                </div>
                <div className="space-y-3">
                    {props.menuItems.map((item, index) => (
                        <MenuItemCard
                            key={index}
                            item={item}
                            onUpdate={(updates) => updateItem(index, updates)}
                            onRemove={() => removeItem(index)}
                            onUploadImage={(e) => handleUploadImage(index, e)}
                            isGenerating={isGenerating}
                        />
                    ))}
                </div>
            </div>

            {/* Cloud Export */}
            <div className="pt-6 border-t border-white/10 space-y-4">
                <div className="flex items-center gap-2 text-[#D4AF37]">
                    <Cloud size={18} />
                    <h2 className="font-bold text-xs uppercase tracking-widest">Render Cloud</h2>
                </div>
                <div className="bg-white/5 rounded-2xl p-4 border border-white/10 space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                        <button onClick={handleCopyProps} className="flex flex-col items-center justify-center gap-2 p-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-all group">
                            <Copy size={20} className="text-amber-500" />
                            <span className="text-[10px] font-bold text-white/70">Copiar Datos</span>
                        </button>
                        <a href="https://github.com/calvin316byBoxesMedia360/BoxesMedia360-Logo-Animation/actions/workflows/render.yml" target="_blank" rel="noopener noreferrer" className="flex flex-col items-center justify-center gap-2 p-3 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 rounded-xl transition-all group text-center">
                            <ExternalLink size={20} className="text-amber-500" />
                            <span className="text-[10px] font-bold text-amber-500">Ir a GitHub</span>
                        </a>
                    </div>
                    <button onClick={handleExportMP4} disabled={isRendering} className={`w-full py-4 rounded-xl flex items-center justify-center gap-3 font-bold text-sm transition-all ${isRendering ? 'bg-amber-500/10 text-amber-500' : 'bg-gradient-to-r from-amber-600 to-amber-500 text-black'}`}>
                        {isRendering ? <Loader2 className="animate-spin" /> : <Download />}
                        <span>{isRendering ? `Renderizando ${renderProgress}%...` : 'Exportar Pro'}</span>
                    </button>
                </div>
            </div>
        </div>
    );
};
