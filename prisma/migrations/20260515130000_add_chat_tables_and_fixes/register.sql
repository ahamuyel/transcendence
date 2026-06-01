SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'Conversation');
SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'ChatMessage');
SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'GameMatch');
