import { getCollection } from 'astro:content';

export interface MonthData {
  month: number;
  count: number;
  url: string;
}

export interface YearData {
  year: number;
  months: MonthData[];
}

export async function getArchiveData(): Promise<YearData[]> {
  const posts = await getCollection('blog');
  
  const publishedPosts = posts.filter(p => !p.data.draft);
  
  const grouped = new Map<number, Map<number, number>>();
  
  for (const post of publishedPosts) {
    const year = post.data.date.getFullYear();
    const month = post.data.date.getMonth() + 1;
    
    if (!grouped.has(year)) {
      grouped.set(year, new Map());
    }
    
    const monthMap = grouped.get(year)!;
    monthMap.set(month, (monthMap.get(month) || 0) + 1);
  }
  
  const result: YearData[] = [];
  
  const sortedYears = Array.from(grouped.keys()).sort((a, b) => b - a);
  
  for (const year of sortedYears) {
    const monthMap = grouped.get(year)!;
    
    const sortedMonths = Array.from(monthMap.keys()).sort((a, b) => b - a);
    
    const months: MonthData[] = sortedMonths.map(month => ({
      month,
      count: monthMap.get(month)!,
      url: `/${year}/${String(month).padStart(2, '0')}/`,
    }));
    
    result.push({
      year,
      months,
    });
  }
  
  return result;
}

export async function getPostsByMonth(year: number, month: number) {
  const posts = await getCollection('blog');
  
  return posts
    .filter(p => {
      if (p.data.draft) return false;
      const d = p.data.date;
      return d.getFullYear() === year && d.getMonth() + 1 === month;
    })
    .sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());
}
