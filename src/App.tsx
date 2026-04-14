import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  Image as ImageIcon, 
  Link as LinkIcon, 
  Settings, 
  Wand2, 
  Sparkles,
  ExternalLink,
  Loader2,
  Plus,
  Copy,
  CheckCircle2
} from 'lucide-react';
import { GoogleGenAI } from '@google/genai';

// Initialize Gemini API
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

export default function App() {
  const [activeTab, setActiveTab] = useState('generator');
  const [productDesc, setProductDesc] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  interface PinIdea {
    title: string;
    description: string;
    imagePrompt: string;
    generatedImageBase64?: string;
    isGeneratingImage?: boolean;
  }
  const [generatedIdeas, setGeneratedIdeas] = useState<PinIdea[]>([]);
  
  // Affiliate Links State
  const [links, setLinks] = useState([
    { id: 1, title: 'Organic Ashwagandha Root', url: 'https://amzn.to/example1', category: 'Supplements' },
    { id: 2, title: 'Premium Yoga Mat', url: 'https://amzn.to/example2', category: 'Fitness' }
  ]);
  const [newLink, setNewLink] = useState({ title: '', url: '', category: 'Supplements' });
  const [copiedId, setCopiedId] = useState<number | null>(null);

  const handleGenerate = async () => {
    if (!productDesc) return;
    
    setIsGenerating(true);
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `You are an expert Pinterest marketer for a wellness brand called "Goddess Fuel Wellness". 
        Generate 5 high-converting Pinterest pin ideas for the following Amazon affiliate product:
        "${productDesc}"
        
        CRITICAL COMPLIANCE: Since these are for affiliate marketing, you MUST include "#ad" or "#amazonaffiliate" in the description to comply with FTC guidelines and Pinterest policies. This prevents pins from being flagged.
        
        Respond ONLY with a valid JSON array of objects, where each object has:
        - "title" (catchy Pinterest title, max 100 chars)
        - "description" (SEO optimized description with hashtags including #ad, max 500 chars)
        - "imagePrompt" (A highly detailed prompt for an AI image generator to create the pin graphic. Focus on a vertical 1000x1500px aspect ratio, a 'Goddess Fuel Wellness' aesthetic (clean, ethereal, feminine, natural lighting, premium wellness vibe), and strong visual appeal for Pinterest.)`,
        config: {
          responseMimeType: "application/json",
        }
      });

      if (response.text) {
        const ideas = JSON.parse(response.text);
        setGeneratedIdeas(ideas);
      }
    } catch (error) {
      console.error("Error generating ideas:", error);
      alert("Failed to generate ideas. Please check your API key and try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerateImage = async (index: number, prompt: string) => {
    setGeneratedIdeas(prev => prev.map((idea, i) => i === index ? { ...idea, isGeneratingImage: true } : idea));
    
    try {
      const response = await ai.models.generateImages({
        model: 'imagen-3.0-generate-002',
        prompt: prompt,
        config: {
          numberOfImages: 1,
          outputMimeType: 'image/jpeg',
          aspectRatio: '3:4'
        }
      });

      const base64Image = response.generatedImages?.[0]?.image?.imageBytes;
      
      if (base64Image) {
        setGeneratedIdeas(prev => prev.map((idea, i) => i === index ? { ...idea, generatedImageBase64: base64Image, isGeneratingImage: false } : idea));
      } else {
        throw new Error("No image generated");
      }
    } catch (error) {
      console.error("Error generating image:", error);
      alert("Failed to generate image. Please check your API key and try again.");
      setGeneratedIdeas(prev => prev.map((idea, i) => i === index ? { ...idea, isGeneratingImage: false } : idea));
    }
  };

  const handleAddLink = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLink.title || !newLink.url) return;
    setLinks([{ ...newLink, id: Date.now() }, ...links]);
    setNewLink({ title: '', url: '', category: 'Supplements' });
  };

  const copyToClipboard = (id: number, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="min-h-screen bg-stone-50 flex text-stone-800 font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-stone-200 flex flex-col">
        <div className="p-6 border-b border-stone-200">
          <h1 className="text-xl font-bold text-rose-700 tracking-tight flex items-center gap-2">
            <Sparkles className="w-5 h-5" />
            Goddess Fuel
          </h1>
          <p className="text-xs text-stone-500 mt-1 uppercase tracking-wider font-semibold">Marketing Hub</p>
        </div>
        
        <nav className="flex-1 p-4 space-y-1">
          <button 
            onClick={() => setActiveTab('dashboard')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${activeTab === 'dashboard' ? 'bg-rose-50 text-rose-700' : 'text-stone-600 hover:bg-stone-100'}`}
          >
            <LayoutDashboard className="w-5 h-5" />
            Dashboard
          </button>
          <button 
            onClick={() => setActiveTab('generator')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${activeTab === 'generator' ? 'bg-rose-50 text-rose-700' : 'text-stone-600 hover:bg-stone-100'}`}
          >
            <Wand2 className="w-5 h-5" />
            Pin Generator
          </button>
          <button 
            onClick={() => setActiveTab('links')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${activeTab === 'links' ? 'bg-rose-50 text-rose-700' : 'text-stone-600 hover:bg-stone-100'}`}
          >
            <LinkIcon className="w-5 h-5" />
            Affiliate Links
          </button>
          <button 
            onClick={() => setActiveTab('assets')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${activeTab === 'assets' ? 'bg-rose-50 text-rose-700' : 'text-stone-600 hover:bg-stone-100'}`}
          >
            <ImageIcon className="w-5 h-5" />
            Brand Assets
          </button>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        {activeTab === 'generator' && (
          <div className="p-8 max-w-5xl mx-auto">
            <header className="mb-8">
              <h2 className="text-3xl font-bold text-stone-900">Pin Generator</h2>
              <p className="text-stone-500 mt-2">Create high-converting Pinterest content for your Amazon affiliate products.</p>
            </header>

            <div className="bg-white rounded-2xl shadow-sm border border-stone-200 p-6 mb-8">
              <label className="block text-sm font-semibold text-stone-700 mb-2">
                Amazon Product Description or Title
              </label>
              <textarea 
                value={productDesc}
                onChange={(e) => setProductDesc(e.target.value)}
                placeholder="e.g., Organic Ashwagandha Root Powder for stress relief and mood support..."
                className="w-full h-32 p-4 border border-stone-200 rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-rose-500 outline-none resize-none transition-all"
              />
              <div className="mt-4 flex justify-end">
                <button 
                  onClick={handleGenerate}
                  disabled={isGenerating || !productDesc}
                  className="bg-rose-600 hover:bg-rose-700 disabled:bg-rose-300 text-white px-6 py-3 rounded-xl font-medium flex items-center gap-2 transition-colors"
                >
                  {isGenerating ? (
                    <><Loader2 className="w-5 h-5 animate-spin" /> Generating...</>
                  ) : (
                    <><Sparkles className="w-5 h-5" /> Generate Pin Ideas</>
                  )}
                </button>
              </div>
            </div>

            {generatedIdeas.length > 0 && (
              <div className="space-y-6">
                <h3 className="text-xl font-bold text-stone-900">Generated Concepts (FTC Compliant)</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {generatedIdeas.map((idea, idx) => (
                    <div key={idx} className="bg-white rounded-2xl shadow-sm border border-stone-200 overflow-hidden flex flex-col">
                      <div className="aspect-[2/3] bg-stone-100 flex flex-col justify-center items-center text-center border-b border-stone-200 relative group overflow-hidden">
                        {idea.generatedImageBase64 ? (
                          <img 
                            src={`data:image/jpeg;base64,${idea.generatedImageBase64}`} 
                            alt={idea.title} 
                            className="w-full h-full object-cover" 
                            referrerPolicy="no-referrer" 
                          />
                        ) : (
                          <div className="p-6 flex flex-col items-center h-full justify-center w-full">
                            <ImageIcon className="w-12 h-12 text-stone-300 mb-4" />
                            <p className="text-xs text-stone-500 line-clamp-4 italic mb-4">
                              "{idea.imagePrompt}"
                            </p>
                            <button 
                              onClick={() => handleGenerateImage(idx, idea.imagePrompt)}
                              disabled={idea.isGeneratingImage}
                              className="bg-stone-900 hover:bg-stone-800 disabled:bg-stone-300 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors z-10 mt-auto"
                            >
                              {idea.isGeneratingImage ? <><Loader2 className="w-4 h-4 animate-spin" /> Generating...</> : <><Wand2 className="w-4 h-4" /> Generate Image</>}
                            </button>
                          </div>
                        )}
                      </div>
                      <div className="p-6 flex-1 flex flex-col">
                        <h4 className="font-bold text-stone-900 mb-2 line-clamp-2">{idea.title}</h4>
                        <p className="text-sm text-stone-600 mb-4 flex-1 line-clamp-4">{idea.description}</p>
                        <button 
                          onClick={() => copyToClipboard(idx + 1000, `${idea.title}\n\n${idea.description}`)}
                          className="w-full py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
                        >
                          {copiedId === idx + 1000 ? <CheckCircle2 className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                          {copiedId === idx + 1000 ? 'Copied!' : 'Copy Details'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'links' && (
          <div className="p-8 max-w-5xl mx-auto">
            <header className="mb-8">
              <h2 className="text-3xl font-bold text-stone-900">Affiliate Links</h2>
              <p className="text-stone-500 mt-2">Manage and organize your Amazon affiliate links for quick access.</p>
            </header>

            <div className="bg-white rounded-2xl shadow-sm border border-stone-200 p-6 mb-8">
              <h3 className="text-lg font-bold text-stone-900 mb-4">Add New Link</h3>
              <form onSubmit={handleAddLink} className="flex gap-4 items-end">
                <div className="flex-1">
                  <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wider mb-2">Product Title</label>
                  <input 
                    type="text" 
                    value={newLink.title}
                    onChange={e => setNewLink({...newLink, title: e.target.value})}
                    placeholder="e.g., Organic Ashwagandha"
                    className="w-full p-3 border border-stone-200 rounded-xl focus:ring-2 focus:ring-rose-500 outline-none"
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wider mb-2">Amazon Link (amzn.to)</label>
                  <input 
                    type="url" 
                    value={newLink.url}
                    onChange={e => setNewLink({...newLink, url: e.target.value})}
                    placeholder="https://amzn.to/..."
                    className="w-full p-3 border border-stone-200 rounded-xl focus:ring-2 focus:ring-rose-500 outline-none"
                  />
                </div>
                <div className="w-48">
                  <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wider mb-2">Category</label>
                  <select 
                    value={newLink.category}
                    onChange={e => setNewLink({...newLink, category: e.target.value})}
                    className="w-full p-3 border border-stone-200 rounded-xl focus:ring-2 focus:ring-rose-500 outline-none bg-white"
                  >
                    <option>Supplements</option>
                    <option>Fitness</option>
                    <option>Beauty</option>
                    <option>Mindfulness</option>
                  </select>
                </div>
                <button 
                  type="submit"
                  disabled={!newLink.title || !newLink.url}
                  className="bg-stone-900 hover:bg-stone-800 disabled:bg-stone-300 text-white px-6 py-3 rounded-xl font-medium flex items-center gap-2 transition-colors h-[50px]"
                >
                  <Plus className="w-5 h-5" /> Add
                </button>
              </form>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-stone-200 overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-stone-50 border-b border-stone-200">
                    <th className="p-4 text-xs font-semibold text-stone-500 uppercase tracking-wider">Product</th>
                    <th className="p-4 text-xs font-semibold text-stone-500 uppercase tracking-wider">Category</th>
                    <th className="p-4 text-xs font-semibold text-stone-500 uppercase tracking-wider">Link</th>
                    <th className="p-4 text-xs font-semibold text-stone-500 uppercase tracking-wider text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {links.map(link => (
                    <tr key={link.id} className="border-b border-stone-100 hover:bg-stone-50">
                      <td className="p-4 font-medium text-stone-900">{link.title}</td>
                      <td className="p-4">
                        <span className="px-3 py-1 bg-rose-50 text-rose-700 rounded-full text-xs font-medium">
                          {link.category}
                        </span>
                      </td>
                      <td className="p-4 text-stone-500 text-sm truncate max-w-[200px]">
                        <a href={link.url} target="_blank" rel="noreferrer" className="hover:text-rose-600 hover:underline flex items-center gap-1">
                          {link.url} <ExternalLink className="w-3 h-3" />
                        </a>
                      </td>
                      <td className="p-4 text-right">
                        <button 
                          onClick={() => copyToClipboard(link.id, link.url)}
                          className="p-2 text-stone-400 hover:text-stone-900 hover:bg-stone-100 rounded-lg transition-colors inline-flex items-center justify-center"
                          title="Copy Link"
                        >
                          {copiedId === link.id ? <CheckCircle2 className="w-5 h-5 text-green-600" /> : <Copy className="w-5 h-5" />}
                        </button>
                      </td>
                    </tr>
                  ))}
                  {links.length === 0 && (
                    <tr>
                      <td colSpan={4} className="p-8 text-center text-stone-500">
                        No affiliate links added yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab !== 'generator' && activeTab !== 'links' && (
          <div className="p-8 flex flex-col items-center justify-center h-full text-stone-500">
            <LayoutDashboard className="w-16 h-16 mb-4 text-stone-300" />
            <h2 className="text-xl font-medium text-stone-900 mb-2">Coming Soon</h2>
            <p>The {activeTab} module is currently under development.</p>
          </div>
        )}
      </main>
    </div>
  );
}
