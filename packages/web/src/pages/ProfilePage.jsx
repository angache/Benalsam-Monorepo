import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate, useLocation as routerLocation, Link } from 'react-router-dom';
import { supabase } from '@/lib/supabaseClient';
import { motion } from 'framer-motion';
import { toast } from '@/components/ui/use-toast.js';
import { Button } from '@/components/ui/button.jsx';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar.jsx';
import { Edit3, User, MapPin, Image as ImageIcon, Star, Eye, MessageSquare, ShoppingBag, Award, Settings, UserPlus, UserMinus, Users, WifiOff } from 'lucide-react';
import ListingCard from '@/components/ListingCard';
import { ThemeContext } from '@/contexts/ThemeContext';
import { fetchUserReviews } from '@/services/reviewService';
import { followUser, unfollowUser, checkIfFollowing, fetchFollowers, fetchFollowingUsers } from '@/services/followService.js';
import { incrementProfileView } from '@/services/profileService.js';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/stores';
import TrustScoreModal from '@/components/TrustScoreModal';

const generateBoringAvatarUrl = (name, userId) => {
  const cleanedName = name ? String(name).replace(/[^a-zA-Z0-9]/g, '') : '';
  const fallbackName = cleanedName || (userId ? String(userId).substring(0, 8) : 'user');
  return `https://source.boringavatars.com/beam/120/${fallbackName}?colors=ff6b35,f7931e,ff8c42,1a0f0a,2d1810`;
};

const ProfileReviews = ({ reviews, currentUserId, onOpenLeaveReviewModal, profileData }) => {
  if (!reviews || reviews.length === 0) {
    return (
      <div className="text-center py-12 glass-effect rounded-xl">
        <Award className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-xl font-semibold mb-2">Henüz Yorum Yok</h3>
        <p className="text-muted-foreground">Bu kullanıcı hakkında henüz bir değerlendirme yapılmamış.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {reviews.map(review => (
        <motion.div 
          key={review.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-effect p-5 rounded-lg shadow-md"
        >
          <div className="flex items-start space-x-4">
            <Link to={`/profil/${review.reviewer.id}`}>
              <Avatar className="w-12 h-12 border-2 border-primary/50">
                <AvatarImage src={review.reviewer.avatar_url || generateBoringAvatarUrl(review.reviewer.name, review.reviewer.id)} alt={review.reviewer.name} key={review.reviewer.avatar_url} />
                <AvatarFallback>{review.reviewer.name?.charAt(0).toUpperCase()}</AvatarFallback>
              </Avatar>
            </Link>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <Link to={`/profil/${review.reviewer.id}`}>
                  <span className="font-semibold text-foreground hover:text-primary">{review.reviewer.name}</span>
                </Link>
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className={cn("w-4 h-4", i < review.rating ? "text-yellow-400 fill-yellow-400" : "text-muted-foreground/50")} />
                  ))}
                </div>
              </div>
              <p className="text-xs text-muted-foreground mb-2">
                {new Date(review.created_at).toLocaleDateString('tr-TR', { year: 'numeric', month: 'long', day: 'numeric' })}
                {review.offers && review.offers.listings && (
                    <> - "<Link to={`/ilan/${review.offers.listings.id}`} className="text-primary hover:underline">{review.offers.listings.title}</Link>" ilanı için</>
                )}
              </p>
              <p className="text-sm text-foreground/90 whitespace-pre-wrap">{review.comment || "Kullanıcı yorum bırakmadı."}</p>
            </div>
          </div>
           {currentUserId && review.offer_id && review.reviewer_id !== currentUserId && review.reviewee_id === currentUserId && (
            <div className="mt-3 text-right">
                <Button 
                    variant="link" 
                    size="sm" 
                    className="text-primary"
                    onClick={() => {
                        const offerForReview = {
                            id: review.offer_id,
                            offering_user_id: review.reviewer_id, 
                            profiles: review.reviewer, 
                            listings: { 
                                id: review.offers.listings.id,
                                title: review.offers.listings.title,
                                profiles: { id: review.reviewee_id, name: profileData?.name } 
                            }
                        };
                        onOpenLeaveReviewModal(offerForReview);
                    }}
                >
                    Cevap Ver (Değerlendir)
                </Button>
            </div>
          )}
        </motion.div>
      ))}
    </div>
  );
};


const ProfilePage = ({ onOpenLeaveReviewModal, openAuthModal, onToggleFavorite }) => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const rLocation = routerLocation(); 
  const { theme } = useContext(ThemeContext);
  const { currentUser } = useAuthStore();
  const [profile, setProfile] = useState(null);
  const [userListings, setUserListings] = useState([]);
  const [userReviews, setUserReviews] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('ilanlar');
  const [isFollowing, setIsFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);

  const isCurrentUserProfile = currentUser && currentUser.id === userId;
  
  const getDisplayLocation = (profileData) => {
    if (!profileData) return "Konum belirtilmemiş";
    const { province, district, neighborhood } = profileData;
    return [province, district, neighborhood].filter(Boolean).join(' / ') || "Konum belirtilmemiş";
  };


  const fetchProfileAndData = async () => {
    setIsLoading(true);
    try {
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (profileError || !profileData) {
        console.error('Error fetching profile or profile not found:', profileError);
        toast({ title: "Profil Bulunamadı", description: "Kullanıcı profili getirilemedi.", variant: "destructive" });
        navigate('/'); 
        return;
      }
      if (profileData.avatar_url) {
        profileData.avatar_url = `${profileData.avatar_url}?t=${new Date().getTime()}`;
      }
      setProfile(profileData);

      if (currentUser && currentUser.id !== userId) {
        setFollowLoading(true);
        const followingStatus = await checkIfFollowing(currentUser.id, userId);
        setIsFollowing(followingStatus);
        setFollowLoading(false);
      }

      const { data: listingsData, error: listingsError } = await supabase
        .from('listings')
        .select('*, user:profiles!user_id(id, name, avatar_url, rating)')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      if (listingsError) throw listingsError;
      setUserListings(listingsData || []);
      
      const reviews = await fetchUserReviews(userId);
      setUserReviews(reviews);

    } catch (error) {
      console.error('Error fetching profile data:', error);
      toast({ title: "Veri Yükleme Hatası", description: `Profil verileri yüklenirken bir sorun oluştu: ${error.message}`, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    if (userId) {
      const hasViewed = sessionStorage.getItem(`viewed_profile_${userId}`);
      if (currentUser && currentUser.id !== userId && !hasViewed) {
        incrementProfileView(userId);
        sessionStorage.setItem(`viewed_profile_${userId}`, 'true');
      }
      fetchProfileAndData();
    }
  }, [userId, currentUser]); 

  useEffect(() => {
    if (currentUser && profile && currentUser.id === profile.id && currentUser.avatar_url !== profile.avatar_url) {
      setProfile(prev => ({ ...prev, avatar_url: currentUser.avatar_url }));
    }
  }, [currentUser, profile]);


  const handleEditProfile = () => {
    navigate('/ayarlar');
  };

  const handleToggleFollow = async () => {
    if (!currentUser) {
      openAuthModal('login');
      return;
    }
    if (isCurrentUserProfile || followLoading || !profile) return;

    setFollowLoading(true);
    let success;
    if (isFollowing) {
      success = await unfollowUser(currentUser.id, profile.id);
    } else {
      success = await followUser(currentUser.id, profile.id);
    }

    if (success) {
      setIsFollowing(!isFollowing);
      setProfile(prevProfile => ({
        ...prevProfile,
        followers_count: isFollowing 
          ? Math.max(0, (prevProfile.followers_count || 0) - 1) 
          : (prevProfile.followers_count || 0) + 1
      }));
    }
    setFollowLoading(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-center p-4">
        <h1 className="text-3xl font-bold text-destructive mb-4">Profil Bulunamadı</h1>
        <p className="text-muted-foreground mb-6">Aradığınız kullanıcı profili mevcut değil veya bir hata oluştu.</p>
        <Button onClick={() => navigate('/')} className="btn-primary">Ana Sayfaya Dön</Button>
      </div>
    );
  }
  
  const StatCard = ({ icon, label, value, onClick }) => (
    <div 
        className={cn("glass-effect p-4 rounded-lg flex flex-col items-center justify-center text-center", onClick && "cursor-pointer hover:bg-primary/10 transition-colors")}
        onClick={onClick}
    >
      {icon}
      <span className="text-2xl font-bold mt-1">{value}</span>
      <span className="text-xs text-muted-foreground">{label}</span>
    </div>
  );

  const displayName = profile.name || profile.username || "İsimsiz Kullanıcı";
  const displayAvatarFallback = displayName.charAt(0).toUpperCase();

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="container mx-auto px-4 py-8"
    >
      <div className="relative bg-card/80 backdrop-blur-md shadow-xl rounded-2xl overflow-hidden p-6 md:p-8 mb-8">
        <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-br from-primary/70 to-secondary/70 opacity-50 -z-10 transform -skew-y-3"></div>
        
        <div className="flex flex-col md:flex-row items-center md:items-start gap-6 relative z-10">
          <Avatar className="w-32 h-32 md:w-40 md:h-40 border-4 border-background shadow-lg">
            <AvatarImage src={profile.avatar_url || generateBoringAvatarUrl(displayName, profile.id)} alt={displayName} key={profile.avatar_url} />
            <AvatarFallback className="text-4xl bg-muted">
              {displayAvatarFallback}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 text-center md:text-left">
            <h1 className="text-3xl md:text-4xl font-bold text-gradient mb-1">{displayName}</h1>
            {profile.username && profile.name && <p className="text-sm text-muted-foreground">@{profile.username}</p>}
            
            <p className="text-muted-foreground flex items-center justify-center md:justify-start mt-2">
              <MapPin className="w-4 h-4 mr-2 text-primary" />
              {getDisplayLocation(profile)}
            </p>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-prose mt-2">
              {profile.bio || (isCurrentUserProfile ? "Henüz bir biyografi eklemediniz." : "Kullanıcının biyografisi bulunmuyor.")}
            </p>
          </div>

          {isCurrentUserProfile ? (
            <Button onClick={handleEditProfile} className="btn-secondary w-full md:w-auto mt-4 md:mt-0 self-center md:self-start">
              <Settings className="w-4 h-4 mr-2" /> Profili ve Ayarları Düzenle
            </Button>
          ) : currentUser && (
            <Button 
              onClick={handleToggleFollow} 
              disabled={followLoading}
              className={cn(
                "w-full md:w-auto mt-4 md:mt-0 self-center md:self-start transition-all",
                isFollowing ? "btn-secondary-amazon" : "btn-primary"
              )}
            >
              {followLoading ? <WifiOff className="w-4 h-4 mr-2 animate-ping" /> : (isFollowing ? <UserMinus className="w-4 h-4 mr-2" /> : <UserPlus className="w-4 h-4 mr-2" />)}
              {isFollowing ? "Takipten Çık" : "Takip Et"}
            </Button>
          )}
        </div>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 mt-8 pt-6 border-t border-border/50">
          <StatCard icon={<ShoppingBag className="w-6 h-6 text-primary"/>} label="İlan Sayısı" value={userListings.length} />
          <StatCard 
            icon={<Users className="w-6 h-6 text-purple-500"/>} 
            label="Takipçi" 
            value={profile.followers_count || 0} 
            onClick={() => {
                toast({ title: "🚧 Bu özellik henüz uygulanmadı—ama merak etme! Bir sonraki istekte talep edebilirsin! 🚀" });
            }}
            />
          <StatCard 
            icon={<Users className="w-6 h-6 text-teal-500"/>} 
            label="Takip Edilen" 
            value={profile.following_count || 0}
             onClick={() => navigate(`/takip-edilenler/${profile.id}`)} 
            />
          <TrustScoreModal profile={profile}>
            <StatCard 
              icon={<Award className="w-6 h-6 text-yellow-400"/>} 
              label="Güven Puanı" 
              value={profile.trust_score || 0} 
            />
          </TrustScoreModal>
          <StatCard icon={<Eye className="w-6 h-6 text-blue-500"/>} label="Profil Görüntülenme" value={profile.profile_views || 0} />
        </div>
      </div>

      <div className="mb-8">
        <div className="flex border-b border-border/50">
          <button 
            onClick={() => setActiveTab('ilanlar')}
            className={`py-3 px-6 font-medium transition-colors duration-200 ${activeTab === 'ilanlar' ? 'text-primary border-b-2 border-primary' : 'text-muted-foreground hover:text-foreground'}`}
          >
            İlanlar ({userListings.length})
          </button>
          <button 
            onClick={() => setActiveTab('yorumlar')}
            className={`py-3 px-6 font-medium transition-colors duration-200 ${activeTab === 'yorumlar' ? 'text-primary border-b-2 border-primary' : 'text-muted-foreground hover:text-foreground'}`}
          >
            Yorumlar ({userReviews.length})
          </button>
        </div>
      </div>

      {activeTab === 'ilanlar' && (
        userListings.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {userListings.map(listing => (
              <ListingCard 
                  key={listing.id} 
                  listing={listing} 
                  onToggleFavorite={onToggleFavorite} 
                  currentUser={currentUser}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 glass-effect rounded-xl">
            <ImageIcon className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">Henüz İlan Yok</h3>
            <p className="text-muted-foreground">
              {isCurrentUserProfile ? "İlk ilanınızı oluşturarak başlayın!" : "Bu kullanıcının henüz yayınlanmış bir ilanı bulunmuyor."}
            </p>
            {isCurrentUserProfile && (
              <Button onClick={() => navigate('/ilan-olustur')} className="mt-6 btn-primary">
                İlan Oluştur
              </Button>
            )}
          </div>
        )
      )}
      {activeTab === 'yorumlar' && (
        <ProfileReviews 
            reviews={userReviews} 
            currentUserId={currentUser?.id}
            onOpenLeaveReviewModal={onOpenLeaveReviewModal}
            profileData={profile}
        />
      )}
    </motion.div>
  );
};

export default ProfilePage;