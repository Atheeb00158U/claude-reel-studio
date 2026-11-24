"""Reference-matched grading: zone-wise LAB colour transfer + luminance histogram match, skin protected.
No added light sources: the grade only remaps colours and tones that are already in the plate."""
import numpy as np, cv2
def to_lab(rgb): return cv2.cvtColor(rgb.astype(np.float32), cv2.COLOR_RGB2LAB)  # rgb 0..1 -> L 0..100
def to_rgb(lab): return np.clip(cv2.cvtColor(lab.astype(np.float32), cv2.COLOR_LAB2RGB),0,1)
def hist_match(src, ref, bins=256):
    s=np.sort(src.ravel()); r=np.sort(ref.ravel())
    q=np.linspace(0,1,bins); sq=np.quantile(s,q); rq=np.quantile(r,q)
    sq=np.maximum.accumulate(sq+np.arange(bins)*1e-6)
    return np.interp(src, sq, rq)
def mkl(A, B):  # Pitie-Kokaram linear map so that cov(A)->cov(B)
    Ca=np.cov(A.T)+np.eye(A.shape[1])*1e-3; Cb=np.cov(B.T)+np.eye(B.shape[1])*1e-3
    Da,Ua=np.linalg.eigh(Ca); Da=np.diag(np.sqrt(np.clip(Da,1e-6,None)))
    C=Da@Ua.T@Cb@Ua@Da; Dc,Uc=np.linalg.eigh(C); Dc=np.diag(np.sqrt(np.clip(Dc,1e-6,None)))
    Dai=np.diag(1/np.diag(Da)); return Ua@Dai@Uc@Dc@Uc.T@Dai@Ua.T
def skin_mask(rgb):
    ycc=cv2.cvtColor((rgb*255).astype(np.uint8),cv2.COLOR_RGB2YCrCb).astype(np.float32)
    m=((ycc[...,1]>135)&(ycc[...,1]<175)&(ycc[...,2]>85)&(ycc[...,2]<130)&(ycc[...,0]>50)).astype(np.float32)
    return cv2.GaussianBlur(m,(0,0),6)
def ref_grade(img, ref, sL=0.75, sC=0.85, skin_keep=0.45, grain=0.012, vignette=0.18, contrast_lock=True):
    A=to_lab(img); R=to_lab(ref)
    L=A[...,0]; Lr=R[...,0]
    Lm=hist_match(L,Lr); Lout=L+(Lm-L)*sL
    # zone weights by source luminance
    def zones(Lc):
        t=Lc/100.0; return [np.clip(1-t/0.4,0,1), np.clip(1-np.abs(t-0.5)/0.3,0,1), np.clip((t-0.6)/0.4,0,1)]
    za=zones(L); zr=zones(Lr)
    ab=A[...,1:].reshape(-1,2); abr=R[...,1:].reshape(-1,2)
    out=np.zeros_like(ab); wsum=np.zeros((ab.shape[0],1))
    for wa,wr in zip(za,zr):
        wa=wa.reshape(-1,1); wr=wr.reshape(-1)
        sel=wr>0.3
        if sel.sum()<200: sel=np.ones_like(wr,bool)
        Bz=abr[sel]; 
        ma=(ab*wa).sum(0)/wa.sum(); mb=Bz.mean(0)
        sa=ab[wa[:,0]>0.3] if (wa[:,0]>0.3).sum()>200 else ab
        T=mkl(sa-ma, Bz-mb)
        out+=wa*((ab-ma)@T.T+mb); wsum+=wa
    abt=out/np.maximum(wsum,1e-4)
    abt=abt.reshape(A[...,1:].shape)
    k=sC*(1-skin_keep*skin_mask(img))[...,None]
    abo=A[...,1:]+(abt-A[...,1:])*k
    res=to_rgb(np.dstack([Lout,abo]))
    H,W=res.shape[:2]; y,x=np.mgrid[0:H,0:W]; d=np.sqrt(((x-W/2)/(W*0.75))**2+((y-H*0.47)/(H*0.7))**2)
    res=res*(1-vignette*np.clip(d,0,1)[...,None]**2)
    res=res+np.random.default_rng(1).normal(0,grain,(H,W))[...,None]
    return np.clip(res,0,1)

def bake_cube(img, ref, path, size=33, sL=0.75, sC=0.85, skin_keep=0.45, title="ref match"):
    """Fit the reference match on `img` (a representative frame) and bake it into a .cube 3D LUT.
    Colour-only parts are baked (tone match, zone colour transfer, skin protection by colour);
    vignette and grain are spatial, so add them in the composition instead."""
    g=np.linspace(0,1,size,dtype=np.float32)
    b,gg,r=np.meshgrid(g,g,g,indexing='ij')           # .cube order: R fastest
    lattice=np.stack([r,gg,b],-1).reshape(-1,1,3)
    # fit on the real frame, apply to the lattice: concatenate so stats come from img only
    H,W=img.shape[:2]
    A=to_lab(img); R=to_lab(ref)
    L=A[...,0].ravel(); Lr=R[...,0].ravel()
    s=np.sort(L); rr=np.sort(Lr); q=np.linspace(0,1,256); sq=np.maximum.accumulate(np.quantile(s,q)+np.arange(256)*1e-6); rq=np.quantile(rr,q)
    X=to_lab(lattice.reshape(size**3,1,3)).reshape(-1,3)
    Lx=X[:,0]; Lout=Lx+(np.interp(Lx,sq,rq)-Lx)*sL
    def zones(Lc):
        t=Lc/100.0; return [np.clip(1-t/0.4,0,1), np.clip(1-np.abs(t-0.5)/0.3,0,1), np.clip((t-0.6)/0.4,0,1)]
    za=zones(L); zr=zones(Lr); zx=zones(Lx)
    ab=A[...,1:].reshape(-1,2); abr=R[...,1:].reshape(-1,2); abx=X[:,1:]
    out=np.zeros_like(abx); ws=np.zeros((abx.shape[0],1))
    for wa,wr,wx in zip(za,zr,zx):
        sel=wr>0.3; sel=sel if sel.sum()>200 else np.ones_like(wr,bool)
        Bz=abr[sel]; wa_=wa.reshape(-1,1)
        ma=(ab*wa_).sum(0)/wa_.sum(); mb=Bz.mean(0)
        sa=ab[wa>0.3] if (wa>0.3).sum()>200 else ab
        T=mkl(sa-ma,Bz-mb); wx_=wx.reshape(-1,1)
        out+=wx_*((abx-ma)@T.T+mb); ws+=wx_
    abt=out/np.maximum(ws,1e-4)
    rgb=lattice.reshape(-1,3)
    ycc=cv2.cvtColor((rgb.reshape(-1,1,3)*255).astype(np.uint8),cv2.COLOR_RGB2YCrCb).reshape(-1,3).astype(np.float32)
    skin=((ycc[:,1]>135)&(ycc[:,1]<175)&(ycc[:,2]>85)&(ycc[:,2]<130)&(ycc[:,0]>50)).astype(np.float32)
    k=(sC*(1-skin_keep*skin))[:,None]
    abo=abx+(abt-abx)*k
    res=to_rgb(np.concatenate([Lout[:,None],abo],1).reshape(-1,1,3)).reshape(-1,3)
    with open(path,'w') as f:
        f.write(f'TITLE "{title}"\nLUT_3D_SIZE {size}\n')
        for p in res: f.write(f'{p[0]:.6f} {p[1]:.6f} {p[2]:.6f}\n')
    return path
