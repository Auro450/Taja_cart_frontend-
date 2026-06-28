with open('src/index.css', 'a') as f:
    f.write('''
/* Fresh Grid layout */
.fresh-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
  padding: 0 16px;
  margin-top: 16px;
}

.fresh-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;
  text-decoration: none;
}

.fresh-item.span-2 {
  grid-column: span 2;
}

.fresh-img-container {
  background-color: #f1f5f9;
  border-radius: 16px;
  width: 100%;
  aspect-ratio: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 8px;
  padding: 12px;
  position: relative;
  overflow: hidden;
}

.fresh-item.span-2 .fresh-img-container {
  aspect-ratio: 2.15;
}

.fresh-img {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}

.fresh-item-name {
  font-size: 12px;
  font-weight: 600;
  color: #334155;
  text-align: center;
  line-height: 1.2;
}
''')
