import React from 'react';
import { ControlsProps } from '../Controls';
import { DiceIcon } from '../IconComponents';
import { 
  PerspectiveDistance, PerspectiveAngle, PerspectivePOV, PerspectiveMovement, PerspectiveLens,
  PERSPECTIVE_DISTANCE, PERSPECTIVE_ANGLE, PERSPECTIVE_POV, PERSPECTIVE_MOVEMENT, PERSPECTIVE_LENS,
  Aperture, ShutterSpeed, ISO, FocusMode, LensType, ShootingMode,
  APERTURE_VALUES, SHUTTER_SPEED_VALUES, ISO_VALUES, FOCUS_MODES, LENS_TYPES, SHOOTING_MODES
} from '../../types';

const CameraControls: React.FC<ControlsProps> = (props) => {
    const formElementClasses = "mt-1 block w-full bg-slate-900/70 border-slate-700 rounded-lg shadow-sm p-3 focus:ring-cyan-500 focus:border-cyan-500 text-slate-200 placeholder:text-slate-500 transition disabled:opacity-50 disabled:cursor-not-allowed";
    const labelClasses = "block text-sm font-medium text-slate-300";

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-cyan-300">Camera Perspective</h3>
                    <button 
                        onClick={props.onRandomizePerspective} 
                        title="Randomize Perspective"
                        className="p-2 rounded-full bg-white/10 text-slate-300 hover:bg-white/20 hover:text-cyan-300 transition-all"
                    >
                        <DiceIcon className="w-5 h-5" />
                    </button>
                </div>
                <div className={`grid grid-cols-1 md:grid-cols-2 gap-4`}>
                    <div>
                        <label htmlFor="perspective-distance" className="block text-sm font-medium text-slate-300 mb-1">Framing / Distance 📏</label>
                        <select id="perspective-distance" value={props.perspectiveDistance} onChange={(e) => props.onPerspectiveDistanceChange(e.target.value as PerspectiveDistance)} className={formElementClasses}>
                            {PERSPECTIVE_DISTANCE.map(o => <option key={o} value={o}>{o}</option>)}
                        </select>
                    </div>
                    <div>
                        <label htmlFor="perspective-angle" className="block text-sm font-medium text-slate-300 mb-1">Angle / Tilt 🎥</label>
                        <select id="perspective-angle" value={props.perspectiveAngle} onChange={(e) => props.onPerspectiveAngleChange(e.target.value as PerspectiveAngle)} className={formElementClasses}>
                            {PERSPECTIVE_ANGLE.map(o => <option key={o} value={o}>{o}</option>)}
                        </select>
                    </div>
                    <div>
                        <label htmlFor="perspective-pov" className="block text-sm font-medium text-slate-300 mb-1">Point of View 👤</label>
                        <select id="perspective-pov" value={props.perspectivePOV} onChange={(e) => props.onPerspectivePOVChange(e.target.value as PerspectivePOV)} className={formElementClasses}>
                            {PERSPECTIVE_POV.map(o => <option key={o} value={o}>{o}</option>)}
                        </select>
                    </div>
                    <div>
                        <label htmlFor="perspective-movement" className="block text-sm font-medium text-slate-300 mb-1">Camera Movement 🏃‍♂️</label>
                        <select id="perspective-movement" value={props.perspectiveMovement} onChange={(e) => props.onPerspectiveMovementChange(e.target.value as PerspectiveMovement)} className={formElementClasses}>
                            {PERSPECTIVE_MOVEMENT.map(o => <option key={o} value={o}>{o}</option>)}
                        </select>
                    </div>
                    <div className="md:col-span-2">
                        <label htmlFor="perspective-lens" className="block text-sm font-medium text-slate-300 mb-1">Lens / Creative Style 🎨</label>
                        <select id="perspective-lens" value={props.perspectiveLens} onChange={(e) => props.onPerspectiveLensChange(e.target.value as PerspectiveLens)} className={formElementClasses}>
                            {PERSPECTIVE_LENS.map(o => <option key={o} value={o}>{o}</option>)}
                        </select>
                    </div>
                </div>
            </div>
             <div className="space-y-4 pt-6 border-t border-white/10">
                <h3 className="text-lg font-semibold text-cyan-300">Advanced Camera Controls</h3>
                <div>
                    <label htmlFor="shooting-mode" className={labelClasses}>Shooting Mode</label>
                    <select id="shooting-mode" value={props.shootingMode} onChange={e => props.onShootingModeChange(e.target.value as ShootingMode)} className={formElementClasses}>
                        {SHOOTING_MODES.map(v => <option key={v} value={v}>{v}</option>)}
                    </select>
                    <p className="text-xs text-slate-500 mt-1">Sets the overall photographic genre and context.</p>
                </div>
                <div className="space-y-4 p-4 rounded-lg bg-white/5 border border-white/10">
                     <h4 className="text-base font-semibold text-slate-200">Lens & Focus</h4>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="lens-type" className={labelClasses}>Lens Type</label>
                            <select id="lens-type" value={props.lensType} onChange={e => props.onLensTypeChange(e.target.value as LensType)} className={formElementClasses}>
                                {LENS_TYPES.map(v => <option key={v} value={v}>{v}</option>)}
                            </select>
                            <p className="text-xs text-slate-500 mt-1">Defines field of view and perspective.</p>
                        </div>
                        <div>
                            <label htmlFor="aperture" className={labelClasses}>Aperture (ƒ)</label>
                            <select id="aperture" value={props.aperture} onChange={e => props.onApertureChange(e.target.value as Aperture)} className={formElementClasses}>
                                {APERTURE_VALUES.map(v => <option key={v} value={v}>{v}</option>)}
                            </select>
                            <p className="text-xs text-slate-500 mt-1">Controls depth of field (background blur).</p>
                        </div>
                     </div>
                     <div>
                        <label htmlFor="focus-mode" className={labelClasses}>Focus On</label>
                        <select id="focus-mode" value={props.focusMode} onChange={e => props.onFocusModeChange(e.target.value as FocusMode)} className={formElementClasses}>
                            {FOCUS_MODES.map(v => <option key={v} value={v}>{v}</option>)}
                        </select>
                    </div>
                    {props.focusMode === 'Manual' && (
                    <div className="mt-4 animate-fade-in">
                        <label htmlFor="manual-focus" className={labelClasses}>Manual Focus Subject</label>
                        <input
                            type="text" id="manual-focus"
                            value={props.manualFocusSubject}
                            onChange={e => props.onManualFocusSubjectChange(e.target.value)}
                            className={formElementClasses}
                            placeholder="e.g., the subject's left eye"
                        />
                        <p className="text-xs text-slate-500 mt-1">Describe exactly what should be perfectly sharp.</p>
                    </div>
                    )}
                </div>
                <div className="space-y-4 p-4 rounded-lg bg-white/5 border border-white/10">
                    <h4 className="text-base font-semibold text-slate-200">Exposure & Color</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div>
                            <label htmlFor="shutter-speed" className={labelClasses}>Shutter Speed</label>
                            <select id="shutter-speed" value={props.shutterSpeed} onChange={e => props.onShutterSpeedChange(e.target.value as ShutterSpeed)} className={formElementClasses}>
                                {SHUTTER_SPEED_VALUES.map(v => <option key={v} value={v}>{v}</option>)}
                            </select>
                            <p className="text-xs text-slate-500 mt-1">Controls motion blur.</p>
                        </div>
                        <div>
                            <label htmlFor="iso" className={labelClasses}>ISO</label>
                            <select id="iso" value={props.iso} onChange={e => props.onISOChange(e.target.value as ISO)} className={formElementClasses}>
                                {ISO_VALUES.map(v => <option key={v} value={v}>{v}</option>)}
                            </select>
                            <p className="text-xs text-slate-500 mt-1">Controls light sensitivity and grain.</p>
                        </div>
                    </div>
                    <div>
                        <label className={labelClasses}>Exposure: <span className="font-mono text-cyan-300">{props.exposure > 0 ? '+' : ''}{props.exposure.toFixed(1)} EV</span></label>
                        <input
                            type="range" min="-2" max="2" step="0.5"
                            value={props.exposure}
                            onChange={e => props.onExposureChange(Number(e.target.value))}
                            style={{ '--value': (props.exposure + 2) * 25 } as React.CSSProperties}
                        />
                        <p className="text-xs text-slate-500 mt-1">Adjusts the overall brightness of the image.</p>
                    </div>
                     <div>
                        <label className={labelClasses}>Lighting Temperature: <span className="font-mono text-cyan-300">{props.lightingTemperature}K</span></label>
                        <input
                            type="range" min="2500" max="7500" step="50"
                            value={props.lightingTemperature}
                            onChange={e => props.onLightingTemperatureChange(Number(e.target.value))}
                            style={{ '--value': (props.lightingTemperature - 2500) / 50 } as React.CSSProperties}
                        />
                        <p className="text-xs text-slate-500 mt-1">Adjusts color warmth (Kelvin). Lower is warmer (orange), higher is cooler (blue).</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CameraControls;
