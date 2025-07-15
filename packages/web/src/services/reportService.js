import { supabase } from '@benalsam/shared-types';
import { toast } from '@/components/ui/use-toast';

export const createListingReport = async (reportData) => {
  const { reporter_id, listing_id, reason, details } = reportData;

  if (!reporter_id || !listing_id || !reason) {
    toast({ title: "Eksik Bilgi", description: "Şikayet oluşturmak için gerekli tüm alanlar doldurulmalıdır.", variant: "destructive" });
    return null;
  }

  const { data, error } = await supabase
    .from('listing_reports')
    .insert([{ reporter_id, listing_id, reason, details }])
    .select()
    .single();

  if (error) {
    console.error('Error creating listing report:', error);
    toast({ title: "Şikayet Oluşturulamadı", description: error.message, variant: "destructive" });
    return null;
  }
  toast({ title: "Şikayet Gönderildi", description: "İlanla ilgili şikayetiniz alınmıştır. En kısa sürede incelenecektir.", variant: "default" });
  return data;
};