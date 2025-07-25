/*
  # Insert sample data for testing

  1. Sample Data
    - Insert 10 sample restoration requests with different statuses
    - Use placeholder images from Pexels
    - Variety of customer information
    - Different timestamps to show progression

  2. Data Distribution
    - 3 pending requests
    - 2 processing requests  
    - 4 completed requests
    - 1 cancelled request
*/

-- Insert sample restoration requests
INSERT INTO customers (
  customer_name,
  customer_email,
  customer_phone,
  original_image_url,
  restored_image_url,
  status,
  notes,
  created_at,
  updated_at
) VALUES
  (
    'Maria Silva',
    'maria.silva@email.com',
    '(11) 99999-1234',
    'https://images.pexels.com/photos/1108099/pexels-photo-1108099.jpeg?auto=compress&cs=tinysrgb&w=400',
    'https://images.pexels.com/photos/1108099/pexels-photo-1108099.jpeg?auto=compress&cs=tinysrgb&w=800',
    'completed',
    'Restauração concluída com sucesso. Cliente muito satisfeito com o resultado.',
    now() - interval '5 days',
    now() - interval '2 days'
  ),
  (
    'João Santos',
    'joao.santos@email.com',
    '(21) 98888-5678',
    'https://images.pexels.com/photos/1108117/pexels-photo-1108117.jpeg?auto=compress&cs=tinysrgb&w=400',
    NULL,
    'pending',
    NULL,
    now() - interval '1 day',
    now() - interval '1 day'
  ),
  (
    'Ana Costa',
    'ana.costa@email.com',
    NULL,
    'https://images.pexels.com/photos/1108101/pexels-photo-1108101.jpeg?auto=compress&cs=tinysrgb&w=400',
    'https://images.pexels.com/photos/1108101/pexels-photo-1108101.jpeg?auto=compress&cs=tinysrgb&w=800',
    'completed',
    'Foto de família restaurada. Removidas manchas e melhorada a nitidez.',
    now() - interval '7 days',
    now() - interval '3 days'
  ),
  (
    'Carlos Oliveira',
    'carlos.oliveira@email.com',
    '(31) 97777-9012',
    'https://images.pexels.com/photos/1108136/pexels-photo-1108136.jpeg?auto=compress&cs=tinysrgb&w=400',
    NULL,
    'processing',
    'Iniciado processo de restauração. Foto com danos significativos.',
    now() - interval '2 days',
    now() - interval '1 hour'
  ),
  (
    'Lucia Ferreira',
    'lucia.ferreira@email.com',
    '(41) 96666-3456',
    'https://images.pexels.com/photos/1108102/pexels-photo-1108102.jpeg?auto=compress&cs=tinysrgb&w=400',
    'https://images.pexels.com/photos/1108102/pexels-photo-1108102.jpeg?auto=compress&cs=tinysrgb&w=800',
    'completed',
    'Restauração de foto antiga concluída. Cores restauradas com sucesso.',
    now() - interval '10 days',
    now() - interval '6 days'
  ),
  (
    'Pedro Almeida',
    'pedro.almeida@email.com',
    NULL,
    'https://images.pexels.com/photos/1108103/pexels-photo-1108103.jpeg?auto=compress&cs=tinysrgb&w=400',
    NULL,
    'pending',
    NULL,
    now() - interval '3 hours',
    now() - interval '3 hours'
  ),
  (
    'Fernanda Lima',
    'fernanda.lima@email.com',
    '(51) 95555-7890',
    'https://images.pexels.com/photos/1108104/pexels-photo-1108104.jpeg?auto=compress&cs=tinysrgb&w=400',
    NULL,
    'cancelled',
    'Cliente solicitou cancelamento. Reembolso processado.',
    now() - interval '4 days',
    now() - interval '3 days'
  ),
  (
    'Roberto Souza',
    'roberto.souza@email.com',
    '(61) 94444-2468',
    'https://images.pexels.com/photos/1108105/pexels-photo-1108105.jpeg?auto=compress&cs=tinysrgb&w=400',
    'https://images.pexels.com/photos/1108105/pexels-photo-1108105.jpeg?auto=compress&cs=tinysrgb&w=800',
    'completed',
    'Foto de casamento restaurada. Removidos riscos e melhorado contraste.',
    now() - interval '8 days',
    now() - interval '4 days'
  ),
  (
    'Camila Rodrigues',
    'camila.rodrigues@email.com',
    '(71) 93333-1357',
    'https://images.pexels.com/photos/1108106/pexels-photo-1108106.jpeg?auto=compress&cs=tinysrgb&w=400',
    NULL,
    'processing',
    'Em andamento. Foto com múltiplos danos, processo complexo.',
    now() - interval '1 day',
    now() - interval '2 hours'
  ),
  (
    'Marcos Pereira',
    'marcos.pereira@email.com',
    '(81) 92222-9753',
    'https://images.pexels.com/photos/1108107/pexels-photo-1108107.jpeg?auto=compress&cs=tinysrgb&w=400',
    NULL,
    'pending',
    NULL,
    now() - interval '6 hours',
    now() - interval '6 hours'
  );