'use client';
import { useCallback, useEffect, useRef, useState } from 'react';

export default function Home() {
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const [loading, setLoading] = useState(false);
  const [framework, setFramework] = useState('Next.js');
  const [searchResponse, setSearchResponse] = useState<string>('');
  const [endStream, setEndStream] = useState(false);
  const [recommendations, setRecommendations] = useState<any>([]);

  const updateRecommendations = useCallback(() => {
    const x = searchResponse?.split('\n');
    // @ts-ignore
    const newRecommendations = x?.map((d, i) => {
      // @ts-ignore
      if ((x?.length ?? (0 - 1 > i || endStream)) && d !== '') {
        const match = d.match(/\d\.\s*(.*?):\s*(.*)/);
        if (match) {
          const [, title, description] = match;
          return { title, description };
        }
      }
      return d;
    });

    if (Array.isArray(newRecommendations)) {
      const formated = newRecommendations.map((recommendation) =>
        typeof recommendation === 'string'
          ? recommendation
          : // @ts-ignore
            `${recommendation.title}: ${recommendation.description}`
      );

      setRecommendations(formated);
    }
  }, [endStream, searchResponse]);

  useEffect(() => {
    updateRecommendations();
  }, [updateRecommendations]);

  const handleClick = async (e: any) => {
    e.preventDefault();
    if (loading) return;
    if (!inputRef) return;

    setLoading(true);
    setSearchResponse('');
    setEndStream(false);

    const fullSearchCriteria = `Me dê uma lista de 5 projetos para desenvolver com o framework ${framework}.  
    ${
      inputRef.current?.value
        ? `Atendendo a seguinte descrição: ${inputRef.current?.value}`
        : ''
    }`;

    console.log('fullSearchCriteria', fullSearchCriteria);

    const response = await fetch('/api/openai', {
      method: 'POST',
      body: JSON.stringify({ searched: fullSearchCriteria }),
      headers: {
        'content-type': 'application/json',
      },
    });

    if (response.ok) {
      try {
        const data = response.body;
        if (!data) {
          return;
        }
        const reader = data.getReader();
        const decoder = new TextDecoder();
        while (true) {
          const { value, done } = await reader.read();
          const chunkValue = decoder.decode(value);
          setSearchResponse((prev) => prev + chunkValue);
          if (done) {
            setEndStream(true);
            break;
          }
        }
      } catch (err) {
        //error = 'Looks like OpenAI timed out :(';
      }
    } else {
      //error = await response.text();
    }
    setLoading(false);
  };

  console.log('recommendations', recommendations);
  console.log('searchResponse', searchResponse);

  return (
    <div className='mt-6'>
      <div className='font-extrabold text-black text-3xl md:text-5xl mb-10'>
        5 dicas de projetos para desenvolver com frameworks JavaScript usando a
        Open AI
      </div>
      <div className='mb-8'>
        <div className='mb-4 font-semibold'>
          Seleciona abaixo qual framework você quer utilizar.
        </div>
        <div>
          <select
            className='p-2 rounded-md border text-gray-600 w-full text-sm'
            value={framework}
            onChange={(e) => setFramework(e.currentTarget.value)}
          >
            <option value='Next.js'> Next.js </option>
            <option value='Svelt'> Svelt </option>
            <option value='Vue.js'> Vue.js </option>
            <option value='Angular.js'> Angular.js </option>
          </select>
        </div>
      </div>
      <div className='my-8'>
        <div className='mb-4 font-semibold'>
          Coloque aqui alguma informação adicional. (optional)
        </div>
        <textarea
          ref={inputRef}
          className='p-2 rounded-md border text-gray-600 w-full h-20 text-sm'
          placeholder='Ex. Projetos utilizando tailwind css.'
        />
        <button
          onClick={handleClick}
          className={`bg-indigo-500 hover:bg-gradient-to-r from-indigo-700 via-indigo-500 to-indigo-700mt-4 w-full h-10 text-white font-bold p-3 rounded flex items-center justify-center`}
        >
          <p>Exibir dicas</p>
        </button>
      </div>
      {recommendations &&
        recommendations.length > 0 &&
        recommendations.map((recommendation, i) => (
          <div className='mb-4 rounded-lg shadow bg-white p-4' key={i}>
            {typeof recommendation !== 'string' ? (
              <div>
                <div className='text-2xl font-bold mb-2'>
                  {recommendation.title}
                </div>
                <div>{recommendation.description}</div>
              </div>
            ) : (
              <div>{recommendation}</div>
            )}
          </div>
        ))}
    </div>
  );
}
