'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import Navbar from '@/components/navbar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/base/input/input';
import { Badge } from '@/components/base/badges/badges';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from '@/components/ui/dialog';
import {
  Search,
  MessageCircle,
  HelpCircle,
  BookOpen,
  Zap,
  Shield,
  Mail,
  ChevronRight,
  X,
  Users,
  Settings,
  ExternalLink,
  ThumbsUp
} from 'lucide-react';
import { supportData, type FAQ, type Guide } from '@/constants/support.data';
import { supportCategoryItems } from '@/constants/support-select-items';

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5  } }
};

// Icon mapping for guides by category
const guideCategoryIcons: Record<string, React.ElementType> = {
  démarrage: Zap,
  profil: Users,
  waitlist: Users,
  réseau: Users,
  dataroom: Shield,
  contenu: BookOpen,
  compte: Settings,
};

// Composants
const FAQCard = ({ faq, onRate }: { faq: FAQ; onRate: (id: string, helpful: boolean) => void }) => (
  <Card className="mb-4">
    <CardHeader>
      <CardTitle className="text-lg flex items-start gap-3">
        <HelpCircle className="h-5 w-5 text-[#5E6AD2] mt-0.5 flex-shrink-0" />
        {faq.question}
      </CardTitle>
    </CardHeader>
    <CardContent>
      <p className="text-gray-700 mb-4">{faq.answer}</p>
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          {faq.tags.map(tag => (
            <Badge key={tag} type="badge-modern" color="gray" size="sm">
              {tag}
            </Badge>
          ))}
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-500">Cette réponse était-elle utile ?</span>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onRate(faq.id, true)}
              className="gap-1 hover:bg-green-50 hover:text-green-600"
            >
              <ThumbsUp className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onRate(faq.id, false)}
              className="gap-1 hover:bg-red-50 hover:text-red-600"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </CardContent>
  </Card>
);

const GuideCard = ({ guide, onClick }: { guide: Guide; onClick: () => void }) => {
  const Icon = guideCategoryIcons[guide.category] ?? BookOpen;
  const difficultyColors: Record<'facile' | 'moyen' | 'avancé', 'success' | 'warning' | 'error'> = {
    facile: 'success',
    moyen: 'warning',
    avancé: 'error',
  };

  return (
    <Card
      className="h-full group hover:border-[#5E6AD2] transition-all duration-300 hover:shadow-xl hover:shadow-[#5E6AD2]/10 cursor-pointer"
      onClick={onClick}
    >
      <CardHeader>
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-[#5E6AD2]/10 rounded-lg">
            <Icon className="h-5 w-5 text-[#5E6AD2]" />
          </div>
          <div className="flex gap-2">
            <Badge type="badge-modern" color="gray" size="sm">
              {guide.duration}
            </Badge>
            <Badge type="pill-color" color={difficultyColors[guide.difficulty]} size="sm">
              {guide.difficulty}
            </Badge>
          </div>
        </div>
        <CardTitle className="text-lg group-hover:text-[#5E6AD2] transition-colors">
          {guide.title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-gray-600 mb-4">{guide.description}</p>
        <div className="flex items-center justify-between">
          <div className="flex gap-1">
            {guide.tags.slice(0, 2).map(tag => (
              <Badge key={tag} type="badge-modern" color="gray" size="sm">
                {tag}
              </Badge>
            ))}
          </div>
          <ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-[#5E6AD2] transition-colors" />
        </div>
      </CardContent>
    </Card>
  );
};

const SupportPage = () => {
  const [activeTab, setActiveTab] = useState('faq');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedGuide, setSelectedGuide] = useState<Guide | null>(null);

  // Filtrage des FAQs
  const filteredFAQs = supportData.faq.filter((faq) => {
    const matchesSearch =
      searchQuery === '' ||
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCategory = selectedCategory === 'all' || faq.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  // Filtrage des Guides
  const filteredGuides = supportData.guides.filter((guide) => {
    const matchesSearch =
      searchQuery === '' ||
      guide.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      guide.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      guide.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCategory = selectedCategory === 'all' || guide.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  const handleFAQRate = (id: string, helpful: boolean) => {
    toast.success(helpful ? 'Merci pour votre retour positif !' : 'Merci pour votre retour, nous améliorerons cette réponse.');
  };

  return (
    <div className="min-h-screen bg-[#FCFCFD]">
      <div className="w-full max-w-screen-xl mx-auto">
        <Navbar />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-8"
        >
          {/* Header */}
          <motion.div variants={cardVariants} className="text-center">
            <h1 className="text-4xl font-bold text-[#101828] mb-4">
              Centre d'aide OneFive
            </h1>
            <p className="text-xl text-[#475467] max-w-2xl mx-auto">
              Trouvez rapidement les réponses à vos questions ou contactez notre équipe support
            </p>
          </motion.div>

          {/* Main Content */}
          <motion.div variants={cardVariants}>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-3 mb-8">
                <TabsTrigger value="faq" className="gap-2">
                  <HelpCircle className="h-4 w-4" />
                  FAQ
                </TabsTrigger>
                <TabsTrigger value="guides" className="gap-2">
                  <BookOpen className="h-4 w-4" />
                  Guides
                </TabsTrigger>
                <TabsTrigger value="contact" className="gap-2">
                  <MessageCircle className="h-4 w-4" />
                  Contact
                </TabsTrigger>
              </TabsList>

              {/* FAQ Tab */}
              <TabsContent value="faq" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Questions fréquentes</CardTitle>
                    <CardDescription>
                      Trouvez rapidement des réponses aux questions les plus courantes
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-col sm:flex-row gap-4 mb-6">
                      <div className="relative flex-1">
                        <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          placeholder="Rechercher dans les FAQ..."
                          value={searchQuery}
                          onChange={setSearchQuery}
                          className="pl-10"
                        />
                      </div>
                      <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                        <SelectTrigger className="w-full sm:w-48">
                          <SelectValue placeholder="Catégorie" />
                        </SelectTrigger>
                        <SelectContent>
                          {supportCategoryItems.map((item) => (
                            <SelectItem key={item.id} value={item.value}>
                              {item.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-4">
                      <AnimatePresence>
                        {filteredFAQs.map((faq) => (
                          <motion.div
                            key={faq.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.3 }}
                          >
                            <FAQCard faq={faq} onRate={handleFAQRate} />
                          </motion.div>
                        ))}
                      </AnimatePresence>
                      
                      {filteredFAQs.length === 0 && (
                        <div className="text-center py-8 text-gray-500">
                          <Search className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                          <p>Aucune question trouvée pour votre recherche.</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Guides Tab */}
              <TabsContent value="guides" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Guides pratiques</CardTitle>
                    <CardDescription>
                      Apprenez à utiliser OneFive avec nos guides détaillés
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-col sm:flex-row gap-4 mb-6">
                      <div className="relative flex-1">
                        <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          placeholder="Rechercher dans les guides..."
                          value={searchQuery}
                          onChange={setSearchQuery}
                          className="pl-10"
                        />
                      </div>
                      <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                        <SelectTrigger className="w-full sm:w-48">
                          <SelectValue placeholder="Catégorie" />
                        </SelectTrigger>
                        <SelectContent>
                          {supportCategoryItems.map((item) => (
                            <SelectItem key={item.id} value={item.value}>
                              {item.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      <AnimatePresence>
                        {filteredGuides.map((guide) => (
                          <motion.div
                            key={guide.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.3 }}
                          >
                            <GuideCard guide={guide} onClick={() => setSelectedGuide(guide)} />
                          </motion.div>
                        ))}
                      </AnimatePresence>
                      {filteredGuides.length === 0 && (
                        <div className="col-span-full text-center py-8 text-gray-500">
                          <BookOpen className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                          <p>Aucun guide trouvé pour votre recherche.</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Contact Tab */}
              <TabsContent value="contact" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Contactez-nous</CardTitle>
                    <CardDescription>
                      Choisissez le canal qui vous convient le mieux
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Email Contact */}
                    <div className="p-6 border rounded-lg hover:bg-gray-50 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-[#5E6AD2]/10 rounded-lg">
                          <Mail className="h-6 w-6 text-[#5E6AD2]" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg mb-1">Email</h3>
                          <p className="text-gray-600 mb-3">Contactez-nous par email pour toute question</p>
                          <a 
                            href="mailto:support@onefive.app" 
                            className="text-[#5E6AD2] hover:text-[#5E6AD2]/80 font-medium"
                          >
                            support@onefive.app
                          </a>
                        </div>
                      </div>
                    </div>

                    {/* Discord Contact */}
                    <div className="p-6 border rounded-lg hover:bg-gray-50 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-[#5865F2]/10 rounded-lg">
                          <svg className="h-6 w-6 text-[#5865F2]" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515a.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0a12.64 12.64 0 0 0-.617-1.25a.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057a19.9 19.9 0 0 0 5.993 3.03a.078.078 0 0 0 .084-.028a14.09 14.09 0 0 0 1.226-1.994a.076.076 0 0 0-.041-.106a13.107 13.107 0 0 1-1.872-.892a.077.077 0 0 1-.008-.128a10.2 10.2 0 0 0 .372-.292a.074.074 0 0 1 .077-.010c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127a12.299 12.299 0 0 1-1.873.892a.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028a19.839 19.839 0 0 0 6.002-3.03a.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.956-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.955-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.946 2.418-2.157 2.418z"/>
                          </svg>
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg mb-1">Discord</h3>
                          <p className="text-gray-600 mb-3">Rejoignez notre communauté Discord</p>
                          <a 
                            href="https://discord.gg/onefive" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-[#5865F2] hover:text-[#5865F2]/80 font-medium inline-flex items-center gap-1"
                          >
                            Rejoindre Discord
                            <ExternalLink className="h-4 w-4" />
                          </a>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </motion.div>
        </motion.div>
      </div>

      {/* Modal détail du guide */}
      <Dialog open={!!selectedGuide} onOpenChange={(open) => !open && setSelectedGuide(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          {selectedGuide && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-2 mb-2">
                  {(() => {
                    const Icon = guideCategoryIcons[selectedGuide.category] ?? BookOpen;
                    return (
                      <div className="p-2 bg-[#5E6AD2]/10 rounded-lg">
                        <Icon className="h-5 w-5 text-[#5E6AD2]" />
                      </div>
                    );
                  })()}
                  <div className="flex gap-2">
                    <Badge type="badge-modern" color="gray" size="sm">
                      {selectedGuide.duration}
                    </Badge>
                    <Badge
                      type="pill-color"
                      size="sm"
                      color={
                        selectedGuide.difficulty === 'facile'
                          ? 'success'
                          : selectedGuide.difficulty === 'moyen'
                            ? 'warning'
                            : 'error'
                      }
                    >
                      {selectedGuide.difficulty}
                    </Badge>
                  </div>
                </div>
                <DialogTitle className="text-xl">{selectedGuide.title}</DialogTitle>
                <DialogDescription className="text-base text-gray-600 mt-1">
                  {selectedGuide.description}
                </DialogDescription>
                <div className="flex flex-wrap gap-1 mt-2">
                  {selectedGuide.tags.map((tag) => (
                    <Badge key={tag} type="badge-modern" color="gray" size="sm">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </DialogHeader>
              <div className="mt-6 space-y-6">
                {selectedGuide.sections.map((section, idx) => (
                  <div key={idx} className="border-l-2 border-[#5E6AD2]/30 pl-4">
                    <h4 className="font-semibold text-[#101828] mb-2">{section.title}</h4>
                    <p className="text-gray-600 text-sm mb-3">{section.content}</p>
                    <ol className="space-y-2 list-decimal list-inside">
                      {section.steps.map((step, stepIdx) => (
                        <li key={stepIdx} className="text-sm text-gray-700">
                          {step.replace(/^\d+\.\s*/, '')}
                        </li>
                      ))}
                    </ol>
                  </div>
                ))}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SupportPage; 