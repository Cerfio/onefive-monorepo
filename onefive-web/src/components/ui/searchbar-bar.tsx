"use client"
import { useState, useRef, useEffect } from 'react'
import { Search, X, Loader2 } from 'lucide-react'
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList
} from '@/components/ui/command'
import { cn } from '@/lib/utils'

type SearchResult = {
    id: string
    type: 'document' | 'folder' | 'user'
    title: string
    subtitle?: string
    icon?: React.ReactNode
}

interface SearchBarProps {
    className?: string
    placeholder?: string
    onSearch?: (query: string) => Promise<SearchResult[]>
    onSelect?: (item: SearchResult) => void
}

export function SearchBar({
    className,
    placeholder = "Rechercher...",
    onSearch,
    onSelect
}: SearchBarProps) {
    const [isOpen, setIsOpen] = useState(false)
    const [query, setQuery] = useState('')
    const [results, setResults] = useState<SearchResult[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const inputRef = useRef<HTMLInputElement>(null)

    // Gestion de la recherche
    useEffect(() => {
        const searchTimeout = setTimeout(async () => {
            if (query.length > 2 && onSearch) {
                setIsLoading(true)
                try {
                    const searchResults = await onSearch(query)
                    setResults(searchResults)
                } catch (error) {
                    console.error('Erreur de recherche:', error)
                    setResults([])
                } finally {
                    setIsLoading(false)
                }
            } else {
                setResults([])
            }
        }, 300)

        return () => clearTimeout(searchTimeout)
    }, [query, onSearch])

    // Raccourcis clavier
    useEffect(() => {
        const down = (e: KeyboardEvent) => {
            if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
                e.preventDefault()
                setIsOpen((open) => !open)
            }
        }

        document.addEventListener('keydown', down)
        return () => document.removeEventListener('keydown', down)
    }, [])

    const handleSelect = (item: SearchResult) => {
        setIsOpen(false)
        setQuery('')
        onSelect?.(item)
    }

    return (
        <div className={cn('relative w-full', className)}>
            <Command
                className={cn(
                    'relative z-50 max-w-lg overflow-visible bg-white',
                    'border border-gray-200 rounded-lg shadow-md'
                )}
            >
                <div className="flex items-center px-3 border-b">
                    <Search className="h-4 w-4 shrink-0 text-gray-500" />
                    <CommandInput
                        ref={inputRef}
                        value={query}
                        onValueChange={setQuery}
                        placeholder={placeholder}
                        className={cn(
                            'flex h-11 w-full rounded-md bg-transparent py-3 px-2',
                            'text-sm outline-none placeholder:text-gray-500',
                            'disabled:cursor-not-allowed disabled:opacity-50'
                        )}
                    />
                    {isLoading && (
                        <Loader2 className="h-4 w-4 animate-spin text-gray-500" />
                    )}
                    {query && !isLoading && (
                        <button
                            onClick={() => setQuery('')}
                            className="hover:text-gray-700"
                        >
                            <X className="h-4 w-4 text-gray-500" />
                        </button>
                    )}
                </div>

                {isOpen && query.length > 0 && (
                    <div className="relative mt-2">
                        <CommandList>
                            <CommandEmpty className="py-6 text-center text-sm">
                                Aucun résultat trouvé.
                            </CommandEmpty>
                            {results.length > 0 && (
                                <CommandGroup heading="Résultats">
                                    {results.map((item) => (
                                        <CommandItem
                                            key={item.id}
                                            onSelect={() => handleSelect(item)}
                                            className="flex items-center gap-2 px-4 py-2 cursor-pointer hover:bg-gray-100"
                                        >
                                            {item.icon}
                                            <div>
                                                <p className="text-sm font-medium">{item.title}</p>
                                                {item.subtitle && (
                                                    <p className="text-xs text-gray-500">
                                                        {item.subtitle}
                                                    </p>
                                                )}
                                            </div>
                                        </CommandItem>
                                    ))}
                                </CommandGroup>
                            )}
                        </CommandList>
                    </div>
                )}
            </Command>
        </div>
    )
}

// Icônes pour les différents types de résultats
export const SearchIcons = {
    document: <Search className="h-4 w-4 text-blue-500" />,
    folder: <Search className="h-4 w-4 text-yellow-500" />,
    user: <Search className="h-4 w-4 text-green-500" />
}